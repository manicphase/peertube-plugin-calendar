async function getLatestVideos () {
  let path = '/api/v1/videos?start=0&count=25&sort=-publishedAt&skipCount=true&isLocal=true&nsfw=false'; 
  let request = await fetch(path);
  let response = await request.json();
  console.log(response);
  return response;
}

function getStartTime(obj) {
  let d = new Date(obj.name.split("-")[1]).getTime()
  if (d) {
    return d
  } else return 0
}

function updateTime(e) {
  //console.log(e);
  window.globalTime = window.mainVideoStats.startTime + (e.position * 1000)
  document.getElementById("timediv").innerHTML = window.globalTime;
  let currentVideos = response.data.filter(function(n) {
    if (globalTime >= n.startTime && globalTime < n.endTime) {
      return true;
    }
  })
  window.currentVideos = currentVideos;
  updateMiniVideos();
}

function makeEmbedCode(videoID) {
  return `<iframe id="${videoID}" src="https://video.manicphase.me/videos/embed/${videoID}?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="100%" height="100%" frameborder="0"></iframe>`
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
  window.mainPlayer.addEventListener("playbackStatusUpdate", function(e){updateTime(e);})
  window.mainVideoStats = response.data.filter(n => n.uuid === videoID)[0];
}

window.setAsMainVideo = setAsMainVideo;

function syncMiniVideo(e, videoID) {
  console.log(videoID, e.position)
  let videoStartTime = window.response.data.filter(r => r.uuid === videoID)[0].startTime;
  console.log(videoStartTime);
  let miniVidTime = videoStartTime + (e.position * 1000)
  console.log(miniVidTime);
  let difference = globalTime - miniVidTime;
  console.log(difference);
}

function updateMiniVideos() {
  let minividdiv = document.getElementById("minivideos")
  for (let i=0; i<window.currentVideos.length; i++) {
      let uuid = window.currentVideos[i].uuid;
      if (!document.getElementById(uuid)) {
        if (uuid !== window.mainVideoStats.uuid) {
          let el = document.createElement("div")
          el.setAttribute("style", "width:200px");
          el.setAttribute("onclick", `setAsMainVideo("${uuid}")`)
          el.setAttribute("id", `${uuid}_div`)
          el.innerHTML = makeEmbedCode(uuid) + `<button type="button" onclick='setAsMainVideo("${uuid}")'>Expand</button>`
          minividdiv.appendChild(el)
          new PeerTubePlayer(document.getElementById(uuid)).addEventListener("playbackStatusUpdate", function(e) {syncMiniVideo(e, uuid)})

          //minividdiv.appendChild(`<div style="width:200px;" onclick='setAsMainVideo("${window.currentVideos[i].uuid}")'id="${window.currentVideos[i].uuid}_div">${makeEmbedCode(window.currentVideos[i].uuid)}</div>`)
        }
      }
  }
}

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
      rootEl.innerHTML = '<div id="mainpanel"><div>Blah</div><div id="mainvideo" style="width:700px;height:400px;"></div><div id="timediv"></div><div id="minivideos"></div><div id="vidlist"></div></div>'
      window.PeerTubePlayer = PeerTubePlayer;

      getLatestVideos().then( function (response) {
        window.response = response;
        let vidlist = "";
        for (let i=0; i<response.data.length; i++) {
          response.data[i].startTime = getStartTime(response.data[i]);
          response.data[i].endTime = response.data[i].startTime + (response.data[i].duration * 1000); 
          let divdata = `<div onclick='setAsMainVideo("${response.data[i].uuid.trim()}")' id="${response.data[i].shortUUID}">${response.data[i].name}</div>`;
          vidlist += divdata;
        }
        window.globalTime = response.data[0].startTime;
        let vidlistdiv = document.getElementById("vidlist");
        vidlistdiv.innerHTML = vidlist;
        updateMiniVideos();
      })
    }
  })
}

export {
  register
}
