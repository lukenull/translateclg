
const ptcls={
    verb:{
        "present":"ishtei",
        

    }
}
const roots={
    nouns:{
        "water":"ayata",
        fire:"alaishe",
        brick:"teguba"
    },
    verbs:{
        "be":"hi",
        "make":"hayon",
        "give":"axa"
    },
    adjectives:{
        "hot":"alai",
        "cold":"yelai"
    },
    pronouns:{
        "I":"wa",
        "he":"kla",
        "me":'wa',
        "him":"kla"
    }
}

export async function translate(englishText) {
    console.log("tryna get shi");
    const response = await fetch("http://localhost:8000/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: englishText })
    });
    console.log(response);
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
    for (let token of parsed.tokens) {
        if (token.pos=="VERB") {
            const lemma=token.lemma;
            const idx=token.i;
            let vb=roots.verbs[lemma];
            if (token.morph.Tense=="Pres") {
                vb+=ptcls.verb.present;
            }
            transtokens.push({eng:lemma,trans:vb,idx:idx});
            for (let chunk of parsed.noun_chunks) {
                const root=chunk.root;
                
                
                if (root.head.i==token.i) {
                    let tok=""
                    if (root.pos=="PRON") {
                        tok=roots.pronouns[root.lemma];
                        if (root.dep=="dative") {
                            tok="yuvne"+tok;
                        }
                    } else {
                        tok=roots.nouns[root.lemma];
                        if (root.tag=="NNS") {
                            tok=`ya${tok}`;
                        }
                    }
                    if (root.dep=="nsubj") {
                        transtokens.push({eng:root.lemma,trans:tok,idx:root.i});
                    }
                    if (root.dep=="dobj") {
                        transtokens.push({eng:root.lemma,trans:tok,idx:root.i});
                    }
                    if (root.dep=="dative") {
                        transtokens.push({eng:root.lemma,trans:tok,idx:root.i});
                    }
                }
                
                for (let token of parsed.tokens) {
                    if (token.head==chunk.root.i && token.dep=="amod" && token.pos=="ADJ") {
                        const lemma=token.lemma;
                        const idx=chunk.root.i;
                        insert(transtokenidx(idx)+1,{eng:lemma,trans:roots.adjectives[lemma],idx:idx});
                    }
                }
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







