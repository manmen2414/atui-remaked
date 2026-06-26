document.addEventListener("pointermove", (e) => {
  const image = document.getElementById("cursor-image");
  if (!image) throw new Error("cursor image not found");

  if (e.pointerType === "mouse") {
    image.style.display = "block";
  } else {
    image.style.display = "none";
  }

  let x = e.clientX - 25;
  let y = e.clientY - 15;

  image.style.transform = `translate(${x}px, ${y}px)`;
});

const area = document.getElementById("myTextBox");
const img = document.getElementById("cursor-image");
document.addEventListener("mouseover", (e) => {
  const img = document.getElementById("cursor-image");
  if (!img || !(img instanceof HTMLImageElement))
    throw new Error("cursor image not found or not image element");
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === "myTextBox" || target.id === "button") {
    img.src = "assets/atsu-sanso.gif";
  }
});

document.addEventListener("mouseout", (e) => {
  const img = document.getElementById("cursor-image");
  if (!img || !(img instanceof HTMLImageElement))
    throw new Error("cursor image not found or not image element");
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.id === "myTextBox" || target.id === "button") {
    img.src = "assets/astukun.gif";
  }
});
