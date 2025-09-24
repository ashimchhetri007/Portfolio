// Set year
const yearEl = document.getElementById("year");
if (yearEl) {
	yearEl.textContent = new Date().getFullYear().toString();
}

// Mobile nav toggle
const navToggle = document.querySelector(".nav-toggle");
const navList = document.getElementById("primary-nav");
if (navToggle && navList) {
	navToggle.addEventListener("click", () => {
		const expanded = navToggle.getAttribute("aria-expanded") === "true";
		navToggle.setAttribute("aria-expanded", (!expanded).toString());
		navList.classList.toggle("open");
	});
}

// Reveal on scroll via IntersectionObserver
const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				observer.unobserve(entry.target);
			}
		});
	},
	{ threshold: 0.2 }
);
reveals.forEach((el) => observer.observe(el));

// Close nav when clicking a link (mobile)
const navLinks = document.querySelectorAll("#primary-nav a");
navLinks.forEach((link) =>
	link.addEventListener("click", () => {
		navList?.classList.remove("open");
		navToggle?.setAttribute("aria-expanded", "false");
	})
);

// Twinkling starfield background
(function () {
	const canvas = document.getElementById("twinkle-canvas");
	if (!canvas) return;
	const ctx = canvas.getContext("2d");
	let dust = [];
	let stars = [];
	let comets = [];
	let width = 0, height = 0, device = Math.min(window.devicePixelRatio || 1, 2);

	function resize() {
		width = canvas.clientWidth = window.innerWidth;
		height = canvas.clientHeight = window.innerHeight;
		canvas.width = Math.floor(width * device);
		canvas.height = Math.floor(height * device);
		ctx.setTransform(device, 0, 0, device, 0, 0);
		initDust();
		initStars();
	}

	function rand(min, max) { return Math.random() * (max - min) + min; }

	function initDust() {
		const count = Math.max(14, Math.floor(Math.sqrt(width * height) / 140)); // ~14-28
		dust = new Array(count).fill(0).map(() => {
			const huePick = Math.random();
			const color = huePick < 0.33 ? "#1b2442" : (huePick < 0.66 ? "#131a31" : "#1a2035");
			return {
				x: Math.random() * width,
				y: Math.random() * height,
				r: rand(120, 280),
				alpha: rand(0.035, 0.08),
				pulse: rand(0.0004, 0.0012),
				base: rand(0.02, 0.06),
				vx: rand(-0.02, 0.02),
				vy: rand(-0.015, 0.015),
				color
			};
		});
	}

	function initStars() {
		const density = 0.00048; // stars per pixel
		const count = Math.floor(width * height * density);
		stars = new Array(count).fill(0).map(() => ({
			x: Math.random() * width,
			y: Math.random() * height,
			r: Math.random() * 1.2 + 0.6,
			phase: Math.random() * Math.PI * 2,
			speed: Math.random() * 0.004 + 0.002, // twinkle speed
			base: Math.random() * 0.4 + 0.2, // base alpha
			vx: Math.random() * 0.06 - 0.03,
			vy: Math.random() * 0.04 - 0.02,
			color: Math.random() < 0.25 ? "#9b7bff" : (Math.random() < 0.5 ? "#6ea8fe" : "#a0a7b4")
		}));
	}

	function spawnComet() {
		if (comets.length >= 2) return;
		const side = Math.random();
		let x, y, vx, vy;
		const speed = Math.random() * 1 + 1.2;
		if (side < 0.5) { x = -50; y = Math.random() * height; vx = speed; vy = Math.random() * 0.6 - 0.3; }
		else { x = Math.random() * (width * 0.3); y = -50; vx = Math.random() * 1 + 0.8; vy = speed; }
		comets.push({ x, y, vx, vy, size: Math.random() * 1 + 1.2, tail: Math.random() * 80 + 100, alpha: 0.0 });
	}

	function drawDust() {
		for (let i = 0; i < dust.length; i++) {
			const d = dust[i];
			const alpha = Math.min(0.12, Math.max(0.01, d.base + Math.sin(performance.now() * d.pulse) * 0.02));
			const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r);
			grad.addColorStop(0, `rgba(110,168,254,${alpha * 0.5})`);
			grad.addColorStop(1, `rgba(26,32,53,0)`);
			ctx.fillStyle = grad;
			ctx.beginPath();
			ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
			ctx.fill();
			d.x += d.vx; d.y += d.vy;
			if (d.x < -d.r) d.x = width + d.r; else if (d.x > width + d.r) d.x = -d.r;
			if (d.y < -d.r) d.y = height + d.r; else if (d.y > height + d.r) d.y = -d.r;
		}
	}

	function drawComets() {
		for (let i = comets.length - 1; i >= 0; i--) {
			const c = comets[i];
			c.x += c.vx; c.y += c.vy; c.alpha = Math.min(0.9, c.alpha + 0.02);
			const tx = c.x - c.vx * c.tail; const ty = c.y - c.vy * c.tail;
			const grad = ctx.createLinearGradient(tx, ty, c.x, c.y);
			grad.addColorStop(0, "rgba(255,255,255,0)"); grad.addColorStop(1, "rgba(200,225,255,0.7)");
			ctx.strokeStyle = grad; ctx.lineWidth = c.size;
			ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(c.x, c.y); ctx.stroke();
			ctx.fillStyle = "rgba(225,240,255,0.95)"; ctx.beginPath(); ctx.arc(c.x, c.y, c.size + 0.6, 0, Math.PI * 2); ctx.fill();
			if (c.x < -200 || c.x > width + 200 || c.y < -200 || c.y > height + 200) { comets.splice(i, 1); }
		}
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		drawDust();
		for (let i = 0; i < stars.length; i++) {
			const s = stars[i]; s.phase += s.speed; const a = s.base + (Math.sin(s.phase) + 1) * 0.25;
			ctx.globalAlpha = Math.min(0.9, Math.max(0.08, a)); ctx.fillStyle = s.color;
			ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
			s.x += s.vx; s.y += s.vy;
			if (s.x < -2) s.x = width + 2; else if (s.x > width + 2) s.x = -2;
			if (s.y < -2) s.y = height + 2; else if (s.y > height + 2) s.y = -2;
		}
		ctx.globalAlpha = 1;
		if (Math.random() < 0.004) spawnComet();
		drawComets();
		requestAnimationFrame(draw);
	}

	window.addEventListener("resize", resize);
	resize();
	requestAnimationFrame(draw);
})();

// Advanced dual-layer custom cursor (ring follows core smoothly)
(function () {
	const core = document.getElementById("cursor-core");
	const ring = document.getElementById("cursor-ring");
	if (!core || !ring) return;

	let mx = window.innerWidth / 2, my = window.innerHeight / 2; // mouse
	let cx = mx, cy = my; // core position
	let rx = mx, ry = my; // ring position
	const coreEase = 0.25; // faster
	const ringEase = 0.16; // smoother, trails delayed core
	const delayMs = 80; // target delay (50-100ms)
	const coreHistory = []; // { x, y, t }
	let prevRx = rx, prevRy = ry;

	function onMove(e) {
		mx = e.clientX; my = e.clientY;
		core.style.opacity = '1'; ring.style.opacity = '1';
	}
	window.addEventListener('mousemove', onMove, { passive: true });
	window.addEventListener('mouseleave', () => { core.style.opacity = '0'; ring.style.opacity = '0'; });
	window.addEventListener('mouseenter', () => { core.style.opacity = '1'; ring.style.opacity = '1'; });

	function getDelayedCore(now) {
		const targetTime = now - delayMs;
		for (let i = coreHistory.length - 1; i >= 0; i--) {
			if (coreHistory[i].t <= targetTime) return coreHistory[i];
		}
		return coreHistory[0] || { x: cx, y: cy, t: now };
	}

	function tick() {
		const now = performance.now();
		// Core moves toward mouse
		cx += (mx - cx) * coreEase; cy += (my - cy) * coreEase;
		core.style.transform = `translate(${cx}px, ${cy}px)`;
		// Record core history
		coreHistory.push({ x: cx, y: cy, t: now });
		while (coreHistory.length && coreHistory[0].t < now - 1000) coreHistory.shift();

		// Ring moves toward delayed core
		const delayed = getDelayedCore(now);
		prevRx = rx; prevRy = ry;
		rx += (delayed.x - rx) * ringEase; ry += (delayed.y - ry) * ringEase;

		// Stretch by ring velocity
		const vx = rx - prevRx; const vy = ry - prevRy;
		const speed = Math.min(1, Math.hypot(vx, vy) / 30);
		const angle = Math.atan2(vy, vx);
		ring.style.transform = `translate(${rx}px, ${ry}px) rotate(${angle}rad) scale(${1 + speed * 0.25}, ${1 - speed * 0.18})`;
		requestAnimationFrame(tick);
	}
	requestAnimationFrame(tick);

	// Hover interactions
	const html = document.documentElement;
	const interactiveSelectors = 'a, button, .btn, [role="button"], input, textarea, select, .project-card, .logo';
	function setExpand(active) { html.classList.toggle('cursor-expand', active); html.classList.toggle('cursor-active', active); }
	function bindHover(el) { el.addEventListener('mouseenter', () => setExpand(true)); el.addEventListener('mouseleave', () => setExpand(false)); }
	function scanInteractive() { document.querySelectorAll(interactiveSelectors).forEach(bindHover); }
	scanInteractive();
	const mo = new MutationObserver(scanInteractive); mo.observe(document.body, { childList: true, subtree: true });

	// Click ripple
	window.addEventListener('mousedown', (e) => {
		html.style.setProperty('--mx', e.clientX + 'px');
		html.style.setProperty('--my', e.clientY + 'px');
		html.classList.add('cursor-ripple');
	});
	window.addEventListener('mouseup', () => {
		setTimeout(() => document.documentElement.classList.remove('cursor-ripple'), 260);
	});
})();
