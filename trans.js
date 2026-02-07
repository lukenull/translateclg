import nlp from 'compromise';

const roots={
    nouns:{
        "water":"ayata",
        fire:"alaishe",
        brick:"teguba"
    },
    verbs:{
        "be":"hi",
        "make":"hayon"
    },
    adjectives:{
        "hot":"alai",
        "cold":"yelai"
    },
    pronouns:{
        "i":"wa",
        "he":"kla"
    }
}

export async function translate(englishText) {
    
    const response = await fetch("http://localhost:8000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: englishText })
    });

    const data = await response.json();
    const parsed = data.parsed;
    console.log(parsed);
    const transtokens=[];
    
    function transtokenidx(i) {
        
        for (let j=0;j<transtokens.length;j++) {
            const ob=transtokens[j];
            if (ob.idx==i) {
                return j;
            }
        }
    }
    function insert(idx,item) {
        transtokens.splice(idx,0,item);
    }
    console.log(parsed.noun_chunks);
    for (let chunk of parsed.noun_chunks) {
        const root=chunk.root;
        let tok=roots.nouns[root.lemma];
        if (root.tag=="NNS") {
            tok=`ya${tok}`;
        }
        transtokens.push({eng:root.lemma,trans:tok,idx:root.i});
        console.log(tok);
        for (let token of parsed.tokens) {
            if (token.head==chunk.root.i && token.dep=="amod" && token.pos=="ADJ") {
                const lemma=token.lemma;
                const idx=chunk.root.i;
                insert(transtokenidx(idx)+1,{eng:lemma,trans:roots.adjectives[lemma],idx:idx});
            }
        }
    }
    console.log(transtokens);
    const ftrans=[];
    for (const obj of transtokens) {
        ftrans.push(obj.trans);
    }
    return ftrans.join(" ");
}







