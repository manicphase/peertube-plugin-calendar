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

function makeEmbedCode(videoID) {
  return '<iframe id="mainplayer" src="https://video.manicphase.me/videos/embed/' + videoID + '?autoplay=1&api=1" allowfullscreen="" sandbox="allow-same-origin allow-scripts allow-popups" width="560" height="315" frameborder="0"></iframe>'
}

function changeMainVideo(videoID) {
  let embedCode = makeEmbedCode(videoID);
  let mainvideodiv = document.getElementById("mainvideo");
  mainvideodiv.innerHTML = embedCode;
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
      rootEl.innerHTML = '<div id="mainpanel"><div>Blah</div><div id="mainvideo"></div><div id="vidlist"></div></div>'
      window.PeerTubePlayer = PeerTubePlayer;
      window.changeMainVideo = changeMainVideo;

      getLatestVideos().then( function (response) {
        let vidlist = "";
        for (let i=0; i<response.data.length; i++) {
          response.data[i].startTime = getStartTime(response.data[0]);
          response.data[i].endTime = response.data[i].startTime + (response.data[i].duration * 1000); 
          vidlist = vidlist + `<div onclick="changeMainVideo("${response.data[i].uuid.trim()}")>${response.data[i].name}</div>`;
          console.log(response.data[i].uuid.trim());
        }
        let vidlistdiv = document.getElementById("vidlist");
        vidlistdiv.innerHTML = vidlist;
        let mainvideodiv = document.getElementById("mainvideo");
        mainvideodiv.innerHTML = makeEmbedCode('5dc2bbc0-7eda-4bda-8659-d361795e8fb2');
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
