async function getLatestVideos (start, count, tag) {
  //let path = `/api/v1/videos?start=${start}&count=${count}&sort=-publishedAt&skipCount=true&nsfw=false`; 
  let path = `/api/v1/search/videos?start=${start}&count=${count}&tagsOneOf=${tag}&sort=-publishedAt&searchTarget=local`;
  let request = await fetch(path);
  let response = await request.json();
  console.log(response);
  return response;
}

function getStartTime(obj) {
  let regex = /\d{1,2}\/\d{1,2}\/\d{4}.*\d{1,2}:\d{1,2}:\d{1,2}\s[P|A]M/
  if (regex.test(obj.name) == true) {
    let d = new Date(obj.name.split("-")[1]).getTime()
      return d;
  }
  let match = obj.name.match(/\d{8}_\d{6}/);
  if (match && match.length > 0) {
    let year = match[0].slice(0,4);
    let month = match[0].slice(4,6);
    let day = match[0].slice(6,8);
    let hour = match[0].slice(9,11);
    let minute = match[0].slice(11,13);
    let second = match[0].slice(13,15);
    let d = new Date(year, parseInt(month) - 1, day, hour, minute, second);
    return d.getTime();
  }
  match = obj.name.match(/\d{4}-\d{2}-\d{2}\s\d{2}-\d{2}-\d{2}/);
  if (match && match.length > 0) {
    let year = match[0].slice(0,4);
    let month = match[0].slice(5,7);
    let day = match[0].slice(8,10);
    let hour = match[0].slice(11,13);
    let minute = match[0].slice(14,16);
    let second = match[0].slice(17,19);
    let d = new Date(year, parseInt(month) - 1, day, hour, minute, second);
    return d.getTime();
  }
  return false; //new Date(obj.createdAt).getTime();
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function setMainVideoHeight(resolution) {
  console.log("RESOLUTION", resolution);
  let actualWidth = frameDiv.offsetWidth;
  let resolutions = mainPlayer.getResolutions()[0];

}

window.setMainVideoHeight = setMainVideoHeight;

function redirectForTag() {
  let tag = document.getElementById("tagInput").value;
  location.href=`https://${location.host}/p/calendar?tag=${tag}`
}

window.redirectForTag = redirectForTag;

window.defaultMainPanel = `<div id="introduction" class="calendarIntroduction"><h2>Welcome to calendar view.</h2>
                              Tag videos and livestreams with a unique or shared tag to create a time synchronised playlist. <br>
                              i.e. If you and a friend both stream a multiplayer game and both tag your streams with #CoopGameStream <br>
                              you can enter "CoopGameStream" in the box below to create a playlist which allows real time switching between videos <br>
                              <input type ="text" id="tagInput"/>
                              <input type="button" onclick="redirectForTag()" value="Create Calendar"/><br><br>
                              note: only live videos and VODs with timestamps in titles are included for now</div>`

function updateTime(e) {
  window.globalTime = window.mainVideoStats.startTime + (e.position * 1000)
  if (watchingLive) {
    window.currentVideos = response.data.filter(function(n) {
    if (n.isLive) {
      return true;
    }})
  } else {
    window.currentVideos = response.data.filter(function(n) {
    if (globalTime >= n.startTime && globalTime < n.endTime) {
      return true;
    }
  })}
  //window.currentVideos = currentVideos;
  updateMiniVideos();
  const date = new Date(globalTime);
  const datestring = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}  ${pad(date.getHours(),2)}:${pad(date.getMinutes(),2)}:${pad(date.getSeconds(),2)}`
  let videoTitle = mainVideoStats.name.split("-")[0];
  document.getElementById("readableTime").innerText = `${videoTitle} ${datestring}`;
}

function makeEmbedCode(videoID) {
  return `<iframe id="${videoID}" src="https://${window.location.hostname}/videos/embed/${videoID}?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="100%" height="100%" frameborder="0"></iframe>`
}

function handleMainPlaybackStatus(e) {
  updateTime(e);
  window.globalVolume = e.volume;
  if (e.playbackState === "ended") {
    let minividdiv = document.getElementById("minivideos");
    if (minividdiv.children.length > 0) {
      setAsMainVideo(minividdiv.children[0].id.split("_")[0])
    }
  }
}

function setAsMainVideo(videoID) {
  let mainvideodiv = document.getElementById("mainvideo");
  let smallVideoDiv = document.getElementById(`${videoID}_div`);
  let smallVideo = document.getElementById(videoID);
  console.log(smallVideo);
  if (mainvideodiv.children.length > 0) {
    mainvideodiv.children[0].remove();
  }
  if (smallVideo) {
    mainvideodiv.appendChild(smallVideo);
  } else {
    mainvideodiv.innerHTML = makeEmbedCode(videoID)
  }
  if (smallVideoDiv) smallVideoDiv.remove();
  window.mainPlayer = new PeerTubePlayer(mainvideodiv.children[0]);
  window.mainPlayer.addEventListener("playbackStatusUpdate", function(e){handleMainPlaybackStatus(e);})
  window.mainPlayer.getResolutions(res => setMainVideoHeight(res))
  window.mainVideoStats = response.data.filter(n => n.uuid === videoID)[0];
  mainPlayer.seek((globalTime - mainVideoStats.startTime) / 1000);
  console.log("main volume", globalVolume);
  mainPlayer.setVolume(globalVolume);
  let liveCheck = response.data.filter(function(n) {
    if (n.uuid === videoID && n.isLive === true) {
      return true;
    }})
  if (liveCheck.length > 0) {
    window.watchingLive = true;
  } else {
    window.watchingLive = false;
  }
  mainvideodiv.scrollIntoView();
  window.scrollBy(0, -document.getElementsByClassName("header")[0].offsetHeight);
}

function resetAndSetAsMain(videoID) {
  window.globalTime = window.response.data.filter(r => r.uuid === videoID)[0].startTime;
  setAsMainVideo(videoID)
}

window.setAsMainVideo = setAsMainVideo;

window.resetAndSetAsMain = resetAndSetAsMain

function syncMiniVideo(e, videoID) {
  let videoStartTime = window.response.data.filter(r => r.uuid === videoID)[0].startTime;
  let miniVidTime = videoStartTime + (e.position * 1000)
  let difference = (globalTime - miniVidTime) / 1000;
  let seektime = e.position + difference;
  if (difference > 0.5 || difference < -0.5) {
    console.log("skip to ", seektime)
    players[videoID].seek(seektime)
  }
  if (seektime > window.response.data.filter(r => r.uuid === videoID)[0].duration || seektime < 0) {
    if (!watchingLive) document.getElementById(videoID + "_div").remove();
  }
}

window.players = {}

function copyToClipboard(text) {
  var input = document.body.appendChild(document.createElement("input"));
  input.value = text;
  input.focus();
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`copied "${text}" to clipboard`);
      })
      .catch((err) => {
        alert(`copied "${text}" to clipboard, using exec`);
        console.log(error);
        document.execCommand("copy")
      });
  input.parentNode.removeChild(input);
}

function createLink() {
  let path = `${window.location.href.split("?")[0]}?videoID=${mainVideoStats.uuid}&timestamp=${Math.floor(globalTime)}&tag=${tag}`
  //await navigator.clipboard.writeText(path);
  copyToClipboard(path);
  //alert(`copied "${path}" to clipboard`);
}

window.createLink = createLink;

function updateMiniVideos() {
  let minividdiv = document.getElementById("minivideos");
  for (let i=0; i<window.currentVideos.length; i++) {
      let uuid = window.currentVideos[i].uuid;
      if (!document.getElementById(uuid)) {
        if (uuid !== window.mainVideoStats.uuid) {
          let el = document.createElement("div")
          el.setAttribute("class", "minivideo");
          el.setAttribute("onclick", `setAsMainVideo("${uuid}")`);
          el.setAttribute("id", `${uuid}_div`);
          el.innerHTML = makeEmbedCode(uuid) + `<div class="minivideoText">${window.currentVideos[i].name}</div>`
          minividdiv.appendChild(el)
          let player = new PeerTubePlayer(document.getElementById(uuid))
          player.addEventListener("playbackStatusUpdate", function(e) {syncMiniVideo(e, uuid)})
          player.setVolume(0);
          player.setResolution(0);
          players[uuid] = player
        }
      }
  }
}

function compare( a, b ) {
  if ( a.startTime < b.startTime ){
      return -1;
  }
  if ( a.startTime > b.startTime ){
      return 1;
  }
  return 0;
}

function makeCalenderEntry(response, i) {
  let obj = response.data[i]
  if(i===0 || (new Date(obj.startTime).getDay() !== new Date(response.data[i-1].startTime).getDay())) {
      let dayBreak = document.createElement("div")
      dayBreak.innerHTML = `<h2>${new Date(obj.startTime).toDateString()}</h2>`;
      dayBreak.setAttribute("class", "dayBreak")
      document.getElementById("calendarContainer").appendChild(dayBreak);
  }
  let classes = "entryWrapper"
  if(i < (response.data.length-1) && (new Date(obj.startTime).getDay() !== new Date(response.data[i+1].startTime).getDay())) {
      classes = "entryWrapper lastCard"
  }
  let parentDepth = response.data.filter(function(o){
      if (obj.startTime > o.startTime && obj.startTime < o.endTime) return true;
  })
  let inset = 20*parentDepth.length;

  if (parentDepth.length === 0) {
    classes = "entryWrapper lastCard";
    let timeBreak = document.createElement("div")
    timeBreak.innerHTML = `<h4 class="timeBreak">${new Date(obj.startTime).toTimeString()}</h4>`;
    document.getElementById("calendarContainer").appendChild(timeBreak);
  }

  let childDepth = response.data.filter(function(o){
    if (o.startTime > obj.startTime && o.startTime < obj.endTime) return true;
  })
  let height = 4 * (childDepth.length + 2);//= 50 + (50*childDepth.length);

  let outer = document.createElement("div")
  outer.setAttribute("class", classes);
  let inner = document.createElement("div");
  inner.setAttribute("class", "calendarCard");
  inner.setAttribute("style", `margin-left:${inset}px;height:${height}em;`)
  let nameDiv = `<div class="calendarNameDiv">${obj.name}</div>`;
  let usernameDiv = `<div class="calendarUsernameDiv">${obj.account.name}</div>`;
  let descriptionDiv = `<div class="calendarDescriptionDiv">${obj.description ?? ''}</div>`;
  let detailsContainer = `<div class="calendarDetailsContainer">${usernameDiv}<br>${descriptionDiv}</div>`;
  let thumbnail = `<img src="https://${document.location.host}${obj.thumbnailPath}" class="calendarThumbnail"/>`
  inner.innerHTML = `${nameDiv} <div class="calendarInfoDiv">${thumbnail} ${detailsContainer}</div>`;
  outer.appendChild(inner);
  outer.setAttribute("onclick", `resetAndSetAsMain("${obj.uuid}")`);
  document.getElementById("calendarContainer").appendChild(outer);
}

function addVideos(start, count, tag) {
  getLatestVideos(start,count,tag).then( function (response) {
    let liveFeeds = [];
    console.log(response);
    for (let i=0; i<response.data.length; i++) {
      let startTime = getStartTime(response.data[i]);
      if (startTime) {
        response.data[i].startTime = startTime;
        response.data[i].endTime = response.data[i].startTime + (response.data[i].duration * 1000);
      } else if (response.data[i].isLive === true) {
        response.data[i].startTime = Date.now();
        liveFeeds.push(response.data[i]);
      }
    }
    response.data = response.data.filter(r => r.startTime !== undefined);
    window.response.data.concat(response.data);
    response.data.sort(compare);

    for (let i=0; i<response.data.length; i++) {
      makeCalenderEntry(response, i);
    }
    console.log(response);
  })
}

window.addVideos = addVideos;

window.makeCalenderEntry = makeCalenderEntry;

function register ({ registerClientRoute, registerHook, peertubeHelpers }) {

  registerHook({
    target: 'filter:left-menu.links.create.result',
    handler: (result) => {
      return [
        {
          key: 'plugin-pages',
          title: 'Plugins',
          links: [
            {
              path: peertubeHelpers.getBasePluginClientPath() + '/calendar',
              icon: '',
              shortLabel: 'calendar',
              label: 'Calendar'
            }
          ]
        }
      ].concat(result)
    }
  })

  registerClientRoute({
    route: '/calendar',
    onMount: ({ rootEl }) => {
      rootEl.innerHTML = `<div id="mainpanel"><h1 id="readableTime" onclick="createLink()"></h1><div style="color:grey;">(click header to copy link to moment)</div><div id="allVideoContainer" class="allVideoContainer"><div id="mainvideo" class="mainVideo"></div><div id="minivideos" class="minivideoContainer"></div></div></div><h2>Calendar</h2><div id="calendarContainer" class="calendarContainer"></div></div>`
      window.PeerTubePlayer = PeerTubePlayer;
      window.watchingLive = true;
      window.globalVolume = 1;
      const urlParams = new URLSearchParams(window.location.search);
      let tag = urlParams.get("tag") ?? "live";
      window.tag = tag;
      let mainVideo = document.getElementById("mainvideo");
      mainVideo.innerHTML = defaultMainPanel;

      getLatestVideos(0,100,tag).then( function (response) {
        window.response = response;
        let liveFeeds = [];
        for (let i=0; i<response.data.length; i++) {
          let startTime = getStartTime(response.data[i]);
          console.log(response.data[i].name, startTime);
          if (startTime) {
            response.data[i].startTime = startTime;
            response.data[i].endTime = response.data[i].startTime + (response.data[i].duration * 1000);
          } else if (response.data[i].isLive === true) {
            response.data[i].startTime = Date.now();
            liveFeeds.push(response.data[i]);
          }
          console.log(response.data)
        }
        response.data = response.data.filter(r => r.startTime !== undefined)
        

        //await addVideos(0,50);
        //console.log("BLAH", window.response)

        //addVideos(0,50).then(function(response) {


        response.data.sort(compare);
        window.globalTime = response.data[0].startTime;


        for (let i=0; i<response.data.length; i++) {
          makeCalenderEntry(response, i);
        }

        let calenderContainer = document.getElementById("calendarContainer");
        calenderContainer.scrollTop = calenderContainer.scrollHeight;

        //const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("timestamp")) {
          console.log("global time", urlParams.get("timestamp"))
          window.globalTime = urlParams.get("timestamp");
        } else if (liveFeeds.length > 0) {
          if (urlParams.get("videoID")) {
            console.log("videoID", urlParams.get("videoID"))
            setAsMainVideo(urlParams.get("videoID"));
          } else {
            setAsMainVideo(liveFeeds[0].uuid);
          }
          updateMiniVideos();
        }
        if (urlParams.get("videoID")) {
          console.log("videoID", urlParams.get("videoID"))
          setAsMainVideo(urlParams.get("videoID"));
          updateMiniVideos();
        }
        if (document.getElementById("mainvideo").childNodes.length === 0) document.getElementById("calendarContainer").scrollIntoView();
      })
    }
  })
}

export {
  register
}
