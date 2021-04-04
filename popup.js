const submitButton = document.getElementById("submitButton");
const sidInput = document.getElementById("sidInput");
const modal = document.getElementsByClassName("modal")[0].outerHTML;

chrome.storage.sync.get("sheet_id", ({ sheet_id }) => {
  sidInput.value = sheet_id;
});

submitButton.addEventListener("click", async () => {
  chrome.storage.sync.set({ sheet_id: sidInput.value, modal });
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: initScript,
  });
});

function initScript() {
  // const host = "http://localhost:3000/api/v1/sheets";
  const host = "https://cwts-pin-server.herokuapp.com/api/v1/sheets";

  function openModal() {
    const el = document.getElementById("cwts-modal");
    el.style.display = "block";
    el.style.left = document.c_pagex - 30 + "px";
    el.style.top = document.c_pagey + "px";
  }

  function handleMouseMove(event) {
    event = event || window.event; // IE-ism

    event.pageX =
      event.clientX +
      ((document && document.scrollLeft) ||
        (document.body && document.body.scrollLeft) ||
        0) -
      ((document && document.clientLeft) ||
        (document.body && document.body.clientLeft) ||
        0);
    event.pageY =
      event.clientY +
      ((document && document.scrollTop) ||
        (document.body && document.body.scrollTop) ||
        0) -
      ((document && document.clientTop) ||
        (document.body && document.body.clientTop) ||
        0);

    document.c_pagex = event.pageX;
    document.c_pagey = event.pageY;
  }

  function sendToSheets(kind, done) {
    fetch(host, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sheet_id: document.c_sid,
        lat: document.c_coords[0],
        long: document.c_coords[1],
        kind,
        remark: "",
      }),
    })
      .then((data) => {
        if (data.status !== 200) {
          console.error(data);
          alert("Error occured. Can't save :(");
        }
        done();
      })
      .catch((err) => {
        console.error(err);
        alert("Error occured. Can't save :(");
        done();
      });
  }

  function setAsLoading() {
    document.getElementById("c-buttons").style.display = "none";
    document.getElementById("c-loading").style.display = "block";
  }

  function setAsDone() {
    document.getElementById("c-buttons").style.display = "block";
    document.getElementById("c-loading").style.display = "none";
  }

  chrome.storage.sync.get("sheet_id", ({ sheet_id }) => {
    document.c_sid = sheet_id;
  });

  chrome.storage.sync.get("modal", ({ modal }) => {
    const el =
      document.getElementById("cwts-modal") || document.createElement(null);
    document.body.appendChild(el);
    el.outerHTML = modal;
    document.getElementById("cwts-modal").style.display = "none";
    document.getElementById("c-loading").style.display = "none";

    document.querySelector("#cancel-option").addEventListener("click", () => {
      document.getElementById("cwts-modal").style.display = "none";
    });
    document.querySelector("#tree-option").addEventListener("click", () => {
      setAsLoading();
      sendToSheets("tree", () => {
        document.getElementById("cwts-modal").style.display = "none";
        setAsDone();
      });
    });
    document.querySelector("#shrub-option").addEventListener("click", () => {
      setAsLoading();
      sendToSheets("shrub", () => {
        document.getElementById("cwts-modal").style.display = "none";
        setAsDone();
      });
    });
    document.querySelector("#other-option").addEventListener("click", () => {
      setAsLoading();
      sendToSheets("other", () => {
        document.getElementById("cwts-modal").style.display = "none";
        setAsDone();
      });
    });
  });

  if (document.f) document.removeEventListener("copy", document.f);
  document.f = (e) => {
    if (e.type == "copy" && e.target.nodeName == "TEXTAREA") {
      openModal(e.target.value);
      document.c_coords = e.target.value.split(", ");
    }
  };

  if (document.mmove) document.removeEventListener("mousemove", document.mmove);
  document.mmove = handleMouseMove;

  document.addEventListener("mousemove", document.mmove);
  document.addEventListener("copy", document.f);
}
