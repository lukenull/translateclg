from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles # Import this
import os

nlp = spacy.load("en_core_web_sm")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. MOUNT THE STATIC FILEROUTE
# This makes everything inside the /static folder available at the root URL
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_index():
    # Ensure this path points correctly to your file location
    return FileResponse('static/index.html')

class TextRequest(BaseModel):
    text: str
def getdict(token):
    return {
         "i": token.i,
            "text": token.text,
            "lemma": token.lemma_,
            "norm": token.norm_,
            "lower": token.lower_,
            "shape": token.shape_,
            "prefix": token.prefix_,
            "suffix": token.suffix_,
            "pos": token.pos_,
            "tag": token.tag_,
            "dep": token.dep_,
            "head": token.head.i,
            "is_alpha": token.is_alpha,
            "is_ascii": token.is_ascii,
            "is_digit": token.is_digit,
            "is_lower": token.is_lower,
            "is_upper": token.is_upper,
            "is_title": token.is_title,
            "is_punct": token.is_punct,
            "is_space": token.is_space,
            "is_stop": token.is_stop,
            "like_num": token.like_num,
            "like_url": token.like_url,
            "like_email": token.like_email,
            "ent_type": token.ent_type_,
            "ent_iob": token.ent_iob_,
            "morph": token.morph.to_dict(),
            "whitespace": token.whitespace_
    }
@app.post("/parse")

def parse_text(request: TextRequest):
    doc = nlp(request.text)

    parsed = {
        "text": doc.text,
        "language": doc.lang_,
        "tokens": [],
        "sentences": [],
        "noun_chunks": [],
        "entities": []
    }

    # TOKENS — basically everything spaCy exposes per-token
    for i, token in enumerate(doc):
        parsed["tokens"].append(getdict(token))

    # SENTENCES
    for sent in doc.sents:
        parsed["sentences"].append({
            "text": sent.text,
            "start": sent.start,
            "end": sent.end,
            "tokens": [token.i for token in sent]
        })

    # NOUN CHUNKS
    for chunk in doc.noun_chunks:
        parsed["noun_chunks"].append({
            "text": chunk.text,
            "start": chunk.start,
            "end": chunk.end,
            "root": {
                "i": chunk.root.i,
                "text": chunk.root.text,
                "lemma": chunk.root.lemma_,
                "pos": chunk.root.pos_,
                "dep": chunk.root.dep_,
                "tag": token.tag_,
                "head": getdict(token.head)
            }
        })

    # NAMED ENTITIES
    for ent in doc.ents:
        parsed["entities"].append({
            "text": ent.text,
            "label": ent.label_,
            "start": ent.start,
            "end": ent.end
        })

    return {"parsed": parsed}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)

