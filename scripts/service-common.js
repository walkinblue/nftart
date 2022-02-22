let settings = {};

function initSettings(ids){
    let data = {};
    for(let id of ids){
        let element = document.getElementById(id);
        data[id]=parseFloat(element.value);
    }
    settings = data;
}
function initSetting(element, id){
    let value = parseFloat(element.value);
    if(!value)value = element.value;
    settings[id] = value;
    console.log(`init setting ${id}: ${value}`);
    let showElement = document.getElementById(id+"Value");
    if(showElement){
        showElement.innerText = settings[id];
    }
}
function settingListener(e){
    const id = e.target.id;
    let value = parseFloat(e.target.value);
    if(!value)value = e.target.value;
    settings[id] = value
    let showElement = document.getElementById(id+"Value");
    if(showElement){
        showElement.innerText = settings[id];
    }
    console.log(`${id} change value ${value}`);
}
function getSettingValue(id){
    return settings[id];
}
function registerSetting(id, func){
    let element = document.getElementById(id);
    if(element == null){
        console.error(`id ${id} is unknown.`);
    }else if(element.tagName == "INPUT" && func ){
        element.addEventListener("change", func);
        initSetting(element, id);
    }else if(element.tagName == "INPUT" && !func ){
        element.addEventListener("change", settingListener);    
        initSetting(element, id);
    }else if(element.tagName == "SELECT" && func ){
        element.addEventListener("change", func);
        initSetting(element, id);
    }else if(element.tagName == "SELECT" && !func ){
        element.addEventListener("change", settingListener);
        initSetting(element, id);
    }else if(element.tagName == "DIV" && func ){
        element.addEventListener("click", func);
    }else if(element.tagName == "DIV" && !func ){
        console.error(`${id} div click should have listener func ..`);
    }else if(element.tagName == "BUTTON" && func ){
        element.addEventListener("click", func);
    }else if(element.tagName == "BUTTON" && !func ){
        console.error(`${id} button click should have listener func ..`);
    }else{
        console.error(`${id} unknow error. ${func} ${element.tagName}`);
    }
}


async function sleep( ms){
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
