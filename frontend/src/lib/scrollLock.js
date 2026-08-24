let lockCount = 0;

export function lockScroll() {
  lockCount++;
  console.log("LOCK called, count now:", lockCount);
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  console.log("UNLOCK called, count now:", lockCount);
  if (lockCount === 0) {
    document.body.style.overflow = "";
  }
}
