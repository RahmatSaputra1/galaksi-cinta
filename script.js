// ====== Ubah teks di sini ======
const WORDS = [
  "Mayta Indriana",
  "Istriku Tersayang",
  "Cintaku Abadi",
  "Aku Mencintaimu",
  "Bahagia Selalu",
  "Cinta dalam Hidupku",
  "Selamanya Kita",
  "Mayta ∞"
];

const MEMORIES = [
  {
    t: "Untuk Mayta",
    e: "🌹",
    x: "Sejak ada kamu, hidupku jadi tempat yang indah. Di setiap kenangan kita, selalu ada kamu, istriku."
  },
  {
    t: "Selamanya",
    e: "💞",
    x: "Mayta, di hidup yang mana pun, aku akan tetap memilihmu. Selamanya dan sehari lagi."
  },
  {
    t: "Cinta dalam Hidupku",
    e: "✨",
    x: "Berapa lama pun kita bersama, rasanya tak pernah cukup. Terima kasih sudah jadi istriku, Mayta. Aku mencintaimu."
  }
];
// ===============================

const R = new THREE.WebGLRenderer({ antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.setSize(innerWidth, innerHeight);
document.body.prepend(R.domElement);

const S = new THREE.Scene(),
      C = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 200);
const G = new THREE.Group();
S.add(G);
G.rotation.x = .38;

const mob = innerWidth < innerHeight;

function resize() {
  R.setSize(innerWidth, innerHeight);
  C.aspect = innerWidth / innerHeight;
  C.position.set(0, 5, innerWidth < innerHeight ? 30 : 23);
  C.lookAt(0, 4, 0);
  C.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// Galaksi spiral
const N = mob ? 14000 : 22000,
      pos = new Float32Array(N * 3),
      col = new Float32Array(N * 3),
      c = new THREE.Color();

for (let i = 0; i < N; i++) {
  const r = Math.pow(Math.random(), .7) * 20 + 1.2,
        arm = i % 3,
        a = r * .55 + arm * Math.PI * 2 / 3 + (Math.random() - .5) * .55 / (r * .12 + .4);
  pos[i * 3] = Math.cos(a) * r;
  pos[i * 3 + 1] = (Math.random() - .5) * .5 * (1.5 - r / 22);
  pos[i * 3 + 2] = Math.sin(a) * r;
  c.setHSL(.93 + Math.random() * .08, .9, .45 + Math.random() * .3 + (1 - r / 21) * .15);
  col.set([c.r, c.g, c.b], i * 3);
}

const gg = new THREE.BufferGeometry();
gg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
gg.setAttribute("color", new THREE.BufferAttribute(col, 3));
const gal = new THREE.Points(
  gg,
  new THREE.PointsMaterial({
    size: .14,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
G.add(gal);

// Lubang hitam + cahaya
const glowTex = (() => {
  const k = document.createElement("canvas");
  k.width = k.height = 128;
  const x = k.getContext("2d"),
        g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "#fff");
  g.addColorStop(.25, "#ff5c9a");
  g.addColorStop(1, "rgba(255,0,100,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(k);
})();

const glow = new THREE.Sprite(
  new THREE.SpriteMaterial({
    map: glowTex,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  })
);
glow.scale.set(7, 7, 1);
G.add(glow);

const hole = new THREE.Mesh(
  new THREE.SphereGeometry(.9, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0x000000 })
);
G.add(hole);

// Hati dari partikel
const HN = 7000,
      hp = new Float32Array(HN * 3);
for (let i = 0; i < HN; i++) {
  const t = Math.random() * Math.PI * 2,
        k = .55 + .45 * Math.random(),
        s = .42;
  hp[i * 3] = 16 * Math.pow(Math.sin(t), 3) * s * k;
  hp[i * 3 + 1] = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * s * k;
  hp[i * 3 + 2] = (Math.random() - .5) * 2.4 * k;
}

const hg = new THREE.BufferGeometry();
hg.setAttribute("position", new THREE.BufferAttribute(hp, 3));
const heart = new THREE.Points(
  hg,
  new THREE.PointsMaterial({
    size: .12,
    color: 0xff6fa5,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
);
heart.position.y = 8;
G.add(heart);

// Teks melayang
function textSprite(txt) {
  const k = document.createElement("canvas");
  k.width = 512;
  k.height = 96;
  const x = k.getContext("2d");
  x.font = "italic 600 44px Georgia,serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = "#ff2d6f";
  x.shadowBlur = 18;
  x.fillStyle = "#ffb3cf";
  x.fillText(txt, 256, 48);

  const s = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(k),
      transparent: true,
      depthWrite: false
    })
  );
  s.scale.set(7, 1.31, 1);
  return s;
}

const texts = WORDS.map((w, i) => {
  const s = textSprite(w);
  s.userData = {
    r: 7 + Math.random() * 9,
    a: i / WORDS.length * Math.PI * 2,
    sp: .12 + Math.random() * .1,
    y: .6 + Math.random() * 1.5
  };
  G.add(s);
  return s;
});

// Hati kecil yang bisa diketuk
function heartSprite() {
  const k = document.createElement("canvas");
  k.width = k.height = 96;
  const x = k.getContext("2d");
  x.font = "64px serif";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.shadowColor = "#ff2d6f";
  x.shadowBlur = 14;
  x.fillText("❤️", 48, 52);

  return new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(k),
      transparent: true,
      depthWrite: false
    })
  );
}

const hearts = [];
for (let i = 0; i < 9; i++) {
  const s = heartSprite();
  s.userData = {
    r: 5 + Math.random() * 12,
    a: Math.random() * 6.28,
    sp: .05 + Math.random() * .08,
    y: 1 + Math.random() * 3,
    m: i % MEMORIES.length,
    ph: Math.random() * 6
  };
  s.scale.set(1.5, 1.5, 1);
  G.add(s);
  hearts.push(s);
}

// Bintang latar
const bp = new Float32Array(1500 * 3);
for (let i = 0; i < bp.length; i++) bp[i] = (Math.random() - .5) * 160;
const bg = new THREE.BufferGeometry();
bg.setAttribute("position", new THREE.BufferAttribute(bp, 3));
S.add(
  new THREE.Points(
    bg,
    new THREE.PointsMaterial({
      size: .2,
      color: 0xffc2d6,
      transparent: true,
      opacity: .6
    })
  )
);

// Interaksi: geser untuk memutar
let dragging = false, lx = 0, ly = 0, vy = 0, moved = 0, started = false, paused = false;
const cv = R.domElement;

cv.addEventListener("pointerdown", e => {
  dragging = true;
  lx = e.clientX;
  ly = e.clientY;
  moved = 0;
});

addEventListener("pointermove", e => {
  if (!dragging) return;
  const dx = e.clientX - lx,
        dy = e.clientY - ly;
  lx = e.clientX;
  ly = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  G.rotation.y += dx * .006;
  G.rotation.x = Math.max(.05, Math.min(1.1, G.rotation.x + dy * .004));
});

addEventListener("pointerup", e => {
  dragging = false;
  if (moved < 6 && started && !paused) pick(e);
});

const ray = new THREE.Raycaster(),
      mv = new THREE.Vector2();

function pick(e) {
  mv.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mv, C);
  let best = null, bd = .09;
  hearts.forEach(h => {
    const p = h.getWorldPosition(new THREE.Vector3()).project(C);
    const d = Math.hypot(p.x - mv.x, (p.y - mv.y) * innerHeight / innerWidth);
    if (d < bd && p.z < 1) {
      bd = d;
      best = h;
    }
  });
  if (best) openMem(best.userData.m);
}

const $ = id => document.getElementById(id);

function openMem(i) {
  const m = MEMORIES[i];
  $("mArt").textContent = m.e;
  $("mTitle").textContent = m.t;
  $("mText").textContent = m.x;
  $("memory").classList.remove("off");
  paused = true;
}

$("back").onclick = () => {
  $("memory").classList.add("off");
  paused = false;
};

$("go").onclick = () => {
  $("intro").classList.add("off");
  started = true;
  $("hint").style.opacity = 1;
  setTimeout(() => $("hint").style.opacity = 0, 6000);
};

const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
const clock = new THREE.Clock();

(function loop() {
  requestAnimationFrame(loop);
  const dt = clock.getDelta(),
        t = clock.elapsedTime;
  if (!dragging && !reduce) G.rotation.y += dt * .06;
  gal.rotation.y += dt * .04;
  const b = 1 + Math.sin(t * 2.2) * .04 + Math.max(0, Math.sin(t * 2.2 + .6)) * .03;
  heart.scale.setScalar(b);
  heart.rotation.y = Math.sin(t * .4) * .35;
  glow.scale.setScalar(6.5 + Math.sin(t * 1.5) * .6);
  texts.forEach(s => {
    const u = s.userData;
    u.a += dt * u.sp * .4;
    s.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(t + u.a) * .2, Math.sin(u.a) * u.r);
  });
  hearts.forEach(h => {
    const u = h.userData;
    u.a += dt * u.sp;
    h.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(t * 1.3 + u.ph) * .6, Math.sin(u.a) * u.r);
    h.scale.setScalar(1.5 + Math.sin(t * 3 + u.ph) * .2);
  });
  R.render(S, C);
})();
