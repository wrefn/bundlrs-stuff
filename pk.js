// hi i'm wren or ovall on discord, contact me if there are any issues!

const element = document.querySelector("#front");

document.addEventListener("DOMContentLoaded", () => {
  const systemId = element.dataset.id;
  const frontCont = document.getElementById("front");
  const expandedArea = document.getElementById("full");
  let expandedMember = null; 

  function expandMemberById(memberId) {
    const memberElement = document.querySelector(`[data-member-id="${memberId}"]`);

    if (memberElement) {
      if (expandedMember && expandedMember !== memberElement) {
        expandedMember.classList.remove('expanded');
        frontCont.appendChild(expandedMember);
      }

      memberElement.classList.add('expanded');
      expandedArea.innerHTML = '';
      expandedArea.appendChild(memberElement);
      expandedMember = memberElement;
    }
  }

  function fetchFront() {
    const apiUrl = `https://api.pluralkit.me/v2/systems/${systemId}/fronters`;

    frontCont.innerHTML = `<div class="member--loading">Loading...</div>`;

    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("<div class='e403'>Access forbidden.</div>");
          } else if (response.status === 404) {
            throw new Error("<div class='e404'>System not found.</div>");
          } else if (response.status === 500) {
            throw new Error("<div class='e500'>Server error.</div>");
          } else {
            throw new Error(`Error ${response.status}`);
          }
        }
        return response.json();
      })
      .then((data) => {
        frontCont.innerHTML = "";

        if (!data.members || data.members.length === 0) {
          frontCont.innerHTML = `<div class="member--error">This system is currently switched out.</div>`;
          return;
        }

        data.members.forEach((member) => {
          const pronouns = member.pronouns || "No pronouns specified";
          const name = member.display_name || member.name || "Unknown name";
          const avatar = member.webhook_avatar_url || member.avatar_url || "n/a";
          const mColor = member.color || "black";
          const mId = member.id || "black";
          const banner = member.banner;
          const bio = member.description;

          const memberElement = document.createElement("div");
          memberElement.classList.add("member--card");
          memberElement.style.setProperty('--member-color', `#${mColor}`);
          memberElement.setAttribute('data-member-id', mId);

          memberElement.innerHTML = `
            <span id="m--R"><span class="member--toggle"><button class="m--e-btn"></button>
            <div style="--member-avatar: url(${avatar})" class="member--avatar"></div></span>
            <span>
	    <div class="member--name mdConvert">${name}</div>
            <div class="member--pronouns mdConvert">${pronouns}</div></span></span>
            <div class="member--details">
              <p class="mdConvert">${bio}</p>
	      <div class="member--banner"><img src="${banner}" style="display: ${banner ? 'block' : 'none'};"></div>
            </div>`;

          frontCont.appendChild(memberElement);

          memberElement.querySelector('.member--toggle').addEventListener('click', (event) => {
            event.preventDefault();
            const currentHash = `#!${mId}`;

            if (memberElement.classList.contains('expanded')) {
              memberElement.classList.remove('expanded');
              frontCont.appendChild(memberElement); 
              
              expandedArea.innerHTML = '';
              expandedMember = null;
              history.pushState(null, null, ' '); 
            } else {
              expandMemberById(mId);
              history.pushState(null, null, currentHash);
            }
          });
        });

        // If there's a hash in the URL, expand the corresponding member
        const currentHash = window.location.hash;
        if (currentHash) {
          const memberId = currentHash.replace('#!', '');
          expandMemberById(memberId);
        }

        parseMD('mdConvert');
      })
      .catch((error) => {
        frontCont.innerHTML = `<div class="member--error">${error.message}</div>`;
      });
  }

  fetchFront();
});

function parseMD(pClass) {
    const containers = document.querySelectorAll(`.${pClass}`);

    containers.forEach(container => {
        let text = container.textContent;
        const emojiRegex = /<:(\w+):(\d+)>/g;

        text = text.replace(emojiRegex, (match, emojiName, emojiId) => {
            const displayName = emojiName.replace(/_/g, ' ');
            const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.png?v=1`;

            return `<img src="${emojiURL}" title="${displayName}" class="member--emoji">`;
        });

        // thankyou stackoverflow
        const underlineRegex = /__(.*?)__/g;
        const boldRegex = /\*\*(.*?)\*\*/g;
        const strikethroughRegex = /~~(.*?)~~/g;
        const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g; 
        const italicRegex = /(\*|_)(.*?)\1/g;
        const newlineRegex = /\n/g;
        const codeRegex = /`([^`]+)`/g;


        text = text.replace(underlineRegex, '<u>$1</u>');
        text = text.replace(boldRegex, '<strong>$1</strong>');
        text = text.replace(strikethroughRegex, '<del>$1</del>');
        text = text.replace(linkRegex, '<a href="$2" target="_blank">$1</a>');
        text = text.replace(italicRegex, '<em>$2</em>');
        text = text.replace(newlineRegex, '<br>');
        text = text.replace(codeRegex, '<code>$1</code>');
      
        container.innerHTML = text;
    });
}

parseMD('mdConvert');
