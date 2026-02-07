const inp=document.getElementById("inputt");
const outp=document.getElementById("outputt");
import {translate} from './trans.js'
inp.addEventListener('input',async ()=>{
    const trans=await translate(inp.value);
    outp.innerText=trans;
})