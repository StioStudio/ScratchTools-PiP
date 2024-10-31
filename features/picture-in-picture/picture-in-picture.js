export default async function ({ feature, console }) {
	// Used to wait for the elements to be accessible.
	await Promise.race([
		ScratchTools.waitForElement(".preview .inner .flex-row.action-buttons"),
		ScratchTools.waitForElement(".menu-bar_account-info-group_MeJZP")
	]);

	// Get the canvas element
	const canvas = feature.traps.vm.renderer.canvas;

	let popup;

	let capturedStream = canvas.captureStream()

	// Check if the document PiP is enabled
	if (feature.settings.get("interactivity-PiP")) {
		if (!("documentPictureInPicture" in window)) {
			console.error("Picture in Picture not supported");
			return;
		}

		let pipWindow;

		const docPopup = document.createElement("div");
		docPopup.insertAdjacentHTML("afterbegin", await (await fetch(feature.self.getResource("popup-html"))).text());
		const popupContent = docPopup.querySelector("div.popup-GUI");

		const video = popupContent.querySelector("video");
		video.setAttribute("autoplay", "autoplay");

		const greenFlag = document.querySelector('img[title="Go"]');
		popupContent.querySelector(".popup-greenflag").addEventListener("click", () => greenFlag.click());

		const redFlag = document.querySelector('img[title="Stop"]');
		popupContent.querySelector(".popup-redflag").addEventListener("click", () => redFlag.click());

		const translateEventPointer = oldEvent => {
			const aRect = canvas.getBoundingClientRect();
			const bRect = video.getBoundingClientRect();

			const newEvent = new oldEvent.constructor(oldEvent.type, {
				bubbles: oldEvent.bubbles,
				cancelable: oldEvent.cancelable,
				clientX: (oldEvent.clientX - bRect.left) * (aRect.width / bRect.width) + aRect.left,
				clientY: (oldEvent.clientY - bRect.top) * (aRect.height / bRect.height) + aRect.top,
				screenX: (oldEvent.screenX - pipWindow.screenLeft + window.screenLeft - bRect.left) * (aRect.width / bRect.width) + aRect.left,
				screenY: (oldEvent.screenY - pipWindow.screenTop + window.screenTop - bRect.top) * (aRect.height / bRect.height) + aRect.top,
				layerX: oldEvent.layerX,
				layerY: oldEvent.layerY,
				button: oldEvent.button,
				buttons: oldEvent.buttons,
				relatedTarget: oldEvent.relatedTarget,
				altKey: oldEvent.altKey,
				ctrlKey: oldEvent.ctrlKey,
				shiftKey: oldEvent.shiftKey,
				metaKey: oldEvent.metaKey,
				movementX: oldEvent.movementX,
				movementY: oldEvent.movementY,
			});

			canvas.dispatchEvent(newEvent);
		};

		["mousedown", "mouseup", "mousemove", "wheel", "touchstart", "touchend", "touchmove"].forEach(eventType => {
			video.addEventListener(eventType, translateEventPointer);
		});

		const translateEventKey = oldEvent => {
			const newEvent = new KeyboardEvent(oldEvent.type, oldEvent);
			document.dispatchEvent(newEvent);
		};

		popup = async function () {
			// console.log(video);
			// console.log(video.srcObject);
			pipWindow = await window.documentPictureInPicture.requestWindow({
				width: canvas.width,
				height: canvas.height + 20 + 6 * 2,
			});

			pipWindow.document.body.append(popupContent);

			console.log(pipWindow);
			console.log(capturedStream);
			pipWindow.document.querySelector("video").srcObject = capturedStream.clone(); // Reset the video stream

			["keydown", "keypress", "keyup"].forEach(eventType => {
				pipWindow.document.addEventListener(eventType, translateEventKey);
			});
		};
	} else {
		const video = document.createElement("video");
		video.setAttribute("autoplay", "autoplay");
		video.setAttribute("style", "width: 100%; height: 100%");

		popup = function () {
			video.srcObject = canvas.captureStream(); // Reset the video stream
			try {
				video.requestPictureInPicture();
			} catch {
				console.log("Picture in Picture not supported or failed to request");
			}
		};
	}

	// Function to create and insert the PiP button
	const createPiPButton = (row, className, textContent, elementType = "button") => {
		if (row.querySelector(".ste-picture-in-picture")) return;
		const openPopup = document.createElement(elementType);
		openPopup.className = className;
		openPopup.textContent = textContent;
		row.insertAdjacentElement("afterbegin", openPopup);
		openPopup.addEventListener('click', popup);
	};

	// Get the row where the button will be inserted
	ScratchTools.waitForElements(".preview .inner .flex-row.action-buttons", row => {
		createPiPButton(row, "button action-button ste-picture-in-picture", "Picture in Picture");
	});

	// Get the row where the button will be inserted
	ScratchTools.waitForElements(".menu-bar_account-info-group_MeJZP", row => {
		createPiPButton(row, "menu-bar_menu-bar-item_oLDa- menu-bar_hoverable_c6WFB", "Picture in Picture", "div");
	});
}
