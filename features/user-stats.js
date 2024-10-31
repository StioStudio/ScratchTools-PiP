async function getStats() {
  if (window.location.href.startsWith("https://scratch.mit.edu/users/")) {
    var response = await fetch(
      `https://scratchdb.lefty.one/v3/user/info/${window.location.href.replaceAll(
        "https://scratch.mit.edu/users/",
        ""
      )}`
    );
    var data = await response.json();
    if (data.statistics != undefined) {
      function image(url, alt) {
        return `<img src='${url}' width='25' height='25' title='${alt}' style='vertical-align:middle; margin:10px'></img>`;
      }
      function space() {
        return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
      }
      function commafy(num) {
        if (num == undefined) {
          return "0";
        } else {
          return parseInt(num).toLocaleString();
        }
      }
      var activity = document.getElementById("activity-feed");
      activity.style.display = "none"; //remove();
      var box = document.getElementsByClassName("doing")[0];
      var table = `${
        "<div style='margin:10px'>#" +
        commafy(data.statistics.ranks.followers) +
        " (#" +
        commafy(data.statistics.ranks.country.followers) +
        ")" +
        space() +
        "</div>"
      }${image(
        "https://scratch.mit.edu/svgs/messages/follow.svg",
        "Followers"
      )}${commafy(data.statistics.followers)}${space()}<br>${image(
        "https://scratch.mit.edu/svgs/messages/love.svg",
        "Loves"
      )}${commafy(data.statistics.loves)}${space()}<br>${image(
        "https://scratch.mit.edu/svgs/messages/favorite.svg",
        "Favorites"
      )}${commafy(data.statistics.favorites)}${space()}<br>${image(
        "https://scratch.mit.edu/svgs/project/views-gray.svg",
        "Views"
      )}${commafy(data.statistics.views)}${space()}<br>`;
      var scratchstats = `<a href="https://scratchstats.com/${window.location.href.replaceAll(
        "https://scratch.mit.edu/users/",
        ""
      )}" style="font-size:10px">View on Scratchstats</a>`;
      var divText =
        `<div id='statistics' style='text-align:center; font-size:20px; padding:2px; background-color: var(--darkWww-box, white);border-radius: 8px;border: 1px solid var(--darkWww-border-15, #d9d9d9);'>${table}${scratchstats}</div>`.replaceAll(
          "undefined",
          "0"
        );
      var div = document.createElement("div");
      div.innerHTML = divText;
      box.appendChild(div);
      var statistics = document.getElementById("statistics");

      //=============Create spans==============
      var children = box.childNodes;
      var h3 = children[1];
      h3.innerText = "";
      var spans = [];

      // functions & variables
      var boxStyle =
        "background-color: var(--darkWww-box, white);border-radius: 8px;border: 1px solid var(--darkWww-border-15, #d9d9d9);padding:2px;cursor:pointer";
      function click(type) {
        if (type) {
          statistics.style.display = "block";
          activity.style.display = "none";
          spans[1].style.fontSize = "75%";
          spans[0].style.fontSize = "90%";
        } else {
          statistics.style.display = "none";
          activity.style.display = "block";
          spans[0].style.fontSize = "75%";
          spans[1].style.fontSize = "90%";
        }
      }

      // #1
      spans[0] = document.createElement("span");
      spans[0].id = "ST-STATS";
      spans[0].innerText = "Statistics";
      spans[0].style = boxStyle;
      h3.appendChild(spans[0]);
      h3.appendChild(document.createTextNode(" "));
      // #2
      spans[1] = document.createElement("span");
      spans[1].id = "ST-WIBD";
      spans[1].innerText = "Recent Activity";
      spans[1].style = `${boxStyle};font-size:80%`;
      h3.appendChild(spans[1]);

      // onclick
      spans[0].onclick = function () {
        click(true);
      };
      spans[1].onclick = function () {
        click(false);
      };
      //===============================
    }
  }
}

ScratchTools.waitForElements(
  "#activity-feed",
  getStats,
  "getUserStatistics",
  false
);
