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
    if (globalTime > n.startTime && globalTime < n.endTime) {
      //console.log(n.startTime);
      //console.log(globalTime);
      //console.log(n.endTime);
      return true;
    }
  })
  window.currentVideos = currentVideos;
  updateMiniVideos();
}

function makeEmbedCode(videoID) {
  return '<iframe id="mainplayer" src="https://video.manicphase.me/videos/embed/' + videoID + '?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="560" height="315" frameborder="0"></iframe>'
}

function makeMiniEmbedCode(videoID) {
  return `<iframe id="${videoID}" src="https://video.manicphase.me/videos/embed/${videoID}?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="300" height="200" frameborder="0"></iframe>`
}

function updateMiniVideos() {
  let minividdiv = document.getElementById("minivideos")
  for (let i=0; currentVideos.length; i++) {
    if (currentVideos[i]) {
      if (!document.getElementById(currentVideos[i].uuid)) {
        if (!currentVideos[i].uuid === currentObject.uuid) {
          minividdiv.insertAdjacentHTML("afterend", makeMiniEmbedCode(currentVideos[i].uuid))
        }
      }
    }
  }
}

function changeMainVideo(videoID) {
  let embedCode = makeEmbedCode(videoID);
  let mainvideodiv = document.getElementById("mainvideo");
  mainvideodiv.innerHTML = embedCode;
  window.mainPlayer = new PeerTubePlayer(document.getElementById("mainplayer"));
  window.mainPlayer.addEventListener("playbackStatusUpdate", function(e){updateTime(e);})
  window.currentObject = response.data.map(n => {n.uuid === videoID})
  window.mainVideoStats = response.data.filter(n => n.uuid === "0aefb77d-9893-4d10-a2e5-c9b8a271d49c")[0];
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
      rootEl.innerHTML = '<div id="mainpanel"><div>Blah</div><div id="mainvideo"></div><div id="timediv"></div><div id="minivideos"></div><div id="vidlist"></div></div>'
      window.PeerTubePlayer = PeerTubePlayer;
      window.changeMainVideo = changeMainVideo;

      getLatestVideos().then( function (response) {
        window.response = response;
        let vidlist = "";
        for (let i=0; i<response.data.length; i++) {
          response.data[i].startTime = getStartTime(response.data[i]);
          response.data[i].endTime = response.data[i].startTime + (response.data[i].duration * 1000); 
          let divdata = `<div onclick='changeMainVideo("${response.data[i].uuid.trim()}")' id="${response.data[i].shortUUID}">${response.data[i].name}</div>`;
          vidlist += divdata;
        }
        let vidlistdiv = document.getElementById("vidlist");
        vidlistdiv.innerHTML = vidlist;
        changeMainVideo(response.data[0].uuid);
        //let mainvideodiv = document.getElementById("mainvideo");
        //mainvideodiv.innerHTML = makeEmbedCode('5dc2bbc0-7eda-4bda-8659-d361795e8fb2');
        //window.mainPlayer = new PeerTubePlayer(document.getElementById("mainplayer"));
        //window.mainPlayer.addEventListener("playbackStatusUpdate", function(e){updateTime(e);})
        //rootEl.innerHTML = '<div id="mainpanel"><div id="mainvideo"></div></div>'
        //rootEl.innerHTML = '<input type="text" id="timestamp"/>'
        //rootEl.innerHTML = '<iframe id="mainplayer" src="https://video.manicphase.me/videos/embed/5dc2bbc0-7eda-4bda-8659-d361795e8fb2?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="560" height="315" frameborder="0"></iframe>'
        //window.PeerTubePlayer = PeerTubePlayer;
        //rootEl.innerHTML = getStartTime(response.data[0]) + " " + getStartTime(response.data[1]);
      })
    }
  })
}

export {
  register
}
