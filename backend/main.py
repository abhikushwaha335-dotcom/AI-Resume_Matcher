from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import spacy
from sentence_transformers import SentenceTransformer, util
import os
import uvicorn


app = FastAPI()

@app.get("/")
def root():
    return {"status": "Backend running"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), jd: str = Form(...)):
    # 1. Extract Text
    pdf_bytes = await file.read()
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    resume_text = "".join([page.get_text() for page in doc])
    
    # 2. CALCULATE SIMILARITY (This was missing in your error image!)
    resume_emb = model.encode(resume_text, convert_to_tensor=True)
    jd_emb = model.encode(jd, convert_to_tensor=True)
    cosine_sim = util.pytorch_cos_sim(resume_emb, jd_emb).item()
    
    # 3. Keyword Extraction
    resume_doc = nlp(resume_text.lower())
    jd_doc = nlp(jd.lower())
    resume_ks = set([t.text for t in resume_doc if t.pos_ in ["NOUN", "PROPN"] and not t.is_stop])
    jd_ks = set([t.text for t in jd_doc if t.pos_ in ["NOUN", "PROPN"] and not t.is_stop])
    
    matched = jd_ks.intersection(resume_ks)
    missing = jd_ks - resume_ks
    
    # 4. Final Score & Suggestions
    final_score = round(cosine_sim * 100, 2)
    
    suggestions = []
    if final_score < 50:
        suggestions.append("🚩 Tone Match: Your resume tone differs significantly from the job post. Use more industry-specific verbs.")
    if missing:
        suggestions.append(f"💡 Keywords: Try adding '{', '.join(list(missing)[:3])}' to your skills section.")
    if len(resume_text) < 600:
        suggestions.append("📝 Depth: Your resume is a bit short. Add more bullet points about your specific impact.")

    return {
        "ats_score": final_score,
        "matched": list(matched)[:10],
        "missing": list(missing)[:10],
        "suggestions": suggestions
    }




