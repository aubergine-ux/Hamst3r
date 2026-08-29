const { createCanvas, loadImage } = require('@napi-rs/canvas');

const WIDTH = 934;
const HEIGHT = 282;
const DEFAULT_ACCENT = '#d9a066';
const PANEL = 'rgba(18, 18, 22, 0.82)';

function roundedRect(ctx, x, y, w, h, r) {
	const radius = Math.min(r, w / 2, h / 2);

	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + w - radius, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
	ctx.lineTo(x + w, y + h - radius);
	ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
	ctx.lineTo(x + radius, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

// Draw an image covering the box, cropping overflow (CSS object-fit: cover).
function drawCover(ctx, image, x, y, w, h) {
	const scale = Math.max(w / image.width, h / image.height);
	const dw = image.width * scale;
	const dh = image.height * scale;

	ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

function shortNumber(value) {
	if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
	if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
	return String(value);
}

async function renderRankCard(options) {
	const { username, avatarUrl, level, rank, into, needed, totalXp, accent, background } = options;

	const canvas = createCanvas(WIDTH, HEIGHT);
	const ctx = canvas.getContext('2d');
	const colour = accent || DEFAULT_ACCENT;

	// --- background ---
	ctx.fillStyle = '#16161a';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	if (background) {
		try {
			const image = await loadImage(background);

			ctx.save();
			roundedRect(ctx, 0, 0, WIDTH, HEIGHT, 24);
			ctx.clip();
			drawCover(ctx, image, 0, 0, WIDTH, HEIGHT);
			ctx.restore();
		} catch {
			// bad or unreachable image: keep the flat background
		}
	}

	// --- translucent panel so text stays readable over any image ---
	ctx.fillStyle = PANEL;
	roundedRect(ctx, 20, 20, WIDTH - 40, HEIGHT - 40, 18);
	ctx.fill();

	// --- avatar ---
	const avatarSize = 160;
	const avatarX = 48;
	const avatarY = (HEIGHT - avatarSize) / 2;

	try {
		const avatar = await loadImage(avatarUrl);

		ctx.save();
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
		ctx.restore();
	} catch {
		ctx.fillStyle = '#2a2a33';
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
		ctx.fill();
	}

	// accent ring around the avatar
	ctx.strokeStyle = colour;
	ctx.lineWidth = 6;
	ctx.beginPath();
	ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3, 0, Math.PI * 2);
	ctx.stroke();

	// --- rank and level, top right ---
	const rightEdge = WIDTH - 52;

	ctx.textAlign = 'right';
	ctx.textBaseline = 'alphabetic';

	ctx.fillStyle = colour;
	ctx.font = 'bold 44px sans-serif';
	ctx.fillText(`LEVEL ${level}`, rightEdge, 92);

	ctx.fillStyle = '#c9c9d4';
	ctx.font = 'bold 30px sans-serif';
	ctx.fillText(`RANK #${rank}`, rightEdge, 132);

	// --- username ---
	const textX = avatarX + avatarSize + 36;

	ctx.textAlign = 'left';
	ctx.fillStyle = '#ffffff';
	ctx.font = 'bold 38px sans-serif';

	let name = username;
	while (ctx.measureText(name).width > 360 && name.length > 3) {
		name = name.slice(0, -1);
	}
	if (name !== username) name += '…';

	ctx.fillText(name, textX, 168);

	// --- xp text ---
	ctx.textAlign = 'right';
	ctx.fillStyle = '#9a9aa8';
	ctx.font = '24px sans-serif';
	ctx.fillText(`${shortNumber(into)} / ${shortNumber(needed)} XP`, rightEdge, 168);

	// --- progress bar ---
	const barX = textX;
	const barY = 190;
	const barW = rightEdge - textX;
	const barH = 34;
	const progress = Math.max(0, Math.min(1, into / needed));

	ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
	roundedRect(ctx, barX, barY, barW, barH, barH / 2);
	ctx.fill();

	if (progress > 0) {
		ctx.fillStyle = colour;
		roundedRect(ctx, barX, barY, Math.max(barH, barW * progress), barH, barH / 2);
		ctx.fill();
	}

	// --- total xp, bottom left under the avatar ---
	ctx.textAlign = 'left';
	ctx.fillStyle = '#7a7a88';
	ctx.font = '20px sans-serif';
	ctx.fillText(`${shortNumber(totalXp)} total XP`, textX, 254);

	return canvas.encode('png');
}

module.exports = { renderRankCard };
