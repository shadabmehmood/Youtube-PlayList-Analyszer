const puppeteer = require('puppeteer');
const pdf = require('pdfkit');
const fs = require('fs');
const link ='https://www.youtube.com/playlist?list=PLW-S5oymMexXTgRyT3BWVt_y608nt85Uj';


(async function(){
    try{
    let browserOpen = puppeteer.launch({
        headless : false,
        defaultViewport : null,
        args :['--start-maximized']
    })
    let browserInstance = await browserOpen;
     let allTabsArr = await browserInstance.pages();
     cTab = allTabsArr[0];
     await cTab.goto(link);
     await cTab.waitForSelector('h1#title');
     let name = await cTab.evaluate(function(select){
        return document.querySelector(select).innerText},'h1#title')
        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer');
        console.log(name , allData.noOfVideos , allData.noOfViews);

        let totalVideos = allData.noOfVideos.split(" ")[0];
        console.log(totalVideos);

        let currentVideos = await getCurrVideosLength();
        console.log(currentVideos);


        //while(totalVideos-currentVideos>=1){
          //  await scrollToBottom();
           // currentVideos =  await getCurrVideosLength();
        // }

        let finalList = await getStats();
        let pdfDoc = new pdf;
        pdfDoc.pipe(fs.createWriteStream('playlist.pdf'));
        pdfDoc.text(JSON.stringify(finalList))
        pdfDoc.end();

        
    }catch(error){
        console.log(error);
    }   
})()




function getData(Selector){
    let allElements = document.querySelectorAll(Selector);
    let noOfVideos = allElements[0].innerText;
    let noOfViews = allElements[1].innerText;
    

    return {
        noOfVideos,
        noOfViews
    }
}



async function getCurrVideosLength(){
    let length = await cTab.evaluate(getLength,'#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer');
    return length;

    
}

function getLength(durationSelector){
    let durationElem = document.querySelectorAll(durationSelector);
    return durationElem.length;
}
async function scrollToBottom(){
    await cTab.evaluate(gotoBottom);
    function gotoBottom(){
        window.scrollBy(0 ,window.innerHeight)
    }
}

async function getStats(){
    let list = await cTab.evaluate(getNameAndDuration, "#video-title" , "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return list;
}



function getNameAndDuration(videoSelector,durationSelector){
    let videoElem = document.querySelectorAll(videoSelector);
    let durationElem = document.querySelectorAll(durationSelector);

    let currentlist= [];
    for(let i=0;i<durationElem.length;i++){
        let videoTitle = videoElem[i].innerText;
        let duration = durationElem[i].innerText;
        currentlist.push({videoTitle,duration});
    }
    return currentlist;
}