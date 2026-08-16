// Release date/time in UTC
const RELEASE_UTC = new Date("2026-12-18T00:00:00Z");

const el = {
  months: document.getElementById("months"),
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  mins: document.getElementById("mins"),
  secs: document.getElementById("secs"),
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Approx "months + remainder" countdown:
// - Count whole calendar months between now and release (UTC)
// - Then compute remaining days/hours/min/sec from the leftover milliseconds
function calcMonthsThenRemainder(now, target) {
  if (now >= target) {
    return { months: 0, days: 0, hours: 0, mins: 0, secs: 0, done: true };
  }

  // Work in UTC components
  let y = now.getUTCFullYear();
  let m = now.getUTCMonth();

  const ty = target.getUTCFullYear();
  const tm = target.getUTCMonth();

  let months = (ty - y) * 12 + (tm - m);

  // Candidate date: add 'months' to now (UTC)
  function addMonthsUTC(date, add) {
    const yy = date.getUTCFullYear();
    const mm = date.getUTCMonth();
    const dd = date.getUTCDate();

    const hh = date.getUTCHours();
    const mi = date.getUTCMinutes();
    const ss = date.getUTCSeconds();
    const ms = date.getUTCMilliseconds();

    const newMonthIndex = mm + add;
    const newY = yy + Math.floor(newMonthIndex / 12);
    const newM = ((newMonthIndex % 12) + 12) % 12;

    // clamp day to end of month
    const lastDay = new Date(Date.UTC(newY, newM + 1, 0)).getUTCDate();
    const newD = Math.min(dd, lastDay);

    return new Date(Date.UTC(newY, newM, newD, hh, mi, ss, ms));
  }

  let candidate = addMonthsUTC(now, months);
  // If candidate overshoots target, step back months until it doesn't
  while (candidate > target && months > 0) {
    months--;
    candidate = addMonthsUTC(now, months);
  }

  const diffMs = target - candidate;
  const totalSec = Math.floor(diffMs / 1000);

  const secs = totalSec % 60;
  const totalMin = Math.floor(totalSec / 60);
  const mins = totalMin % 60;
  const totalHr = Math.floor(totalMin / 60);
  const hours = totalHr % 24;
  const days = Math.floor(totalHr / 24);

  return { months, days, hours, mins, secs, done: false };
}

function tick() {
  const now = new Date();
  const r = calcMonthsThenRemainder(now, RELEASE_UTC);

  el.months.textContent = pad2(r.months);
  el.days.textContent = pad2(r.days);
  el.hours.textContent = pad2(r.hours);
  el.mins.textContent = pad2(r.mins);
  el.secs.textContent = pad2(r.secs);

  if (r.done) {
    document.querySelector("h1").textContent = "DOOMSDAY IS HERE";
  }
}

const bg = document.getElementById("bg");

document.addEventListener("click", () => {
    bg.muted = false;
    bg.play();
}, { once: true });

tick();
setInterval(tick, 250);
