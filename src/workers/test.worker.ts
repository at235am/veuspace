import { Ring, union } from "polygon-clipping";

// const ctx: Worker = self as unknown as Worker;

// async function start() {
//   ctx.postMessage({
//     type: "tsData",
//     data: "shared",
//   });
// }

// ctx.addEventListener("message", (evt) => {
//   switch (evt.data.type) {
//     case "start":
//       // start();
//       return;
//   }
// });

onmessage = function (e) {
  // console.log("starting work", e);

  // console.log("Message received from main script");
  // const workerResult = `Result: ${e.data[0] * e.data[1]}`;
  // postMessage(workerResult);

  // console.log(e.data);
  const outlinePoints = e.data;

  const faces = union([outlinePoints as Ring]);

  this.postMessage(faces);
};
