let artworks = [
  { title: "0223單元零 色塊繪製", url: "https://tkuzhiyun-wq.github.io/20260223/" },
  { title: "0302單元零 魚塊繪製", url: "https://tkuzhiyun-wq.github.io/20260302/" },
  { title: "0309單元一 單元1 增添色彩", url: "https://tkuzhiyun-wq.github.io/20260309/" },
  { title: "0316單元二 網頁元素", url: "https://tkuzhiyun-wq.github.io/20260316/" },
  { title: "0323單元三 海葵繪製", url: "https://tkuzhiyun-wq.github.io/20260323/" },
  { title: "0330單元四 電流急急棒", url: "https://tkuzhiyun-wq.github.io/20260330/" },
  { title: "0420單元五 即時影像與像素", url: "https://tkuzhiyun-wq.github.io/20260420-1/" }
];

let thumbnailWidth = 200;
let thumbnailHeight = 150;
let spacing = 30;
let wallColor = 20; // 深灰色基調
let parallaxOffset = 0;
let modal, modalContent, closeBtn, iframe;
let particles = [];
let thumbnailIframes = [];
let selectedArtwork = -1;
let hoveredArtwork = -1;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Get modal elements
  modal = document.getElementById('modal');
  closeBtn = document.querySelector('.close');
  iframe = document.getElementById('artwork-iframe');
  
  // Verify modal elements exist
  if (!modal) console.error('Modal element not found');
  if (!iframe) console.error('Iframe element not found');

  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = "none";
      iframe.src = "";
    }
  }

  if (modal) {
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
        iframe.src = "";
      }
    }
  }

  // Add keyboard event to close modal
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
      modal.style.display = "none";
      if (iframe) iframe.src = "";
    }
  });

  // Create thumbnail iframes
  for (let i = 0; i < artworks.length; i++) {
    let iframeElement = document.createElement('iframe');
    iframeElement.src = artworks[i].url;
    iframeElement.style.position = 'absolute';
    iframeElement.style.border = 'none';
    iframeElement.style.pointerEvents = 'none';
    document.body.appendChild(iframeElement);
    thumbnailIframes.push(iframeElement);
  }

  // 初始化背景浮游粒子
  for (let i = 0; i < 1000; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // 繪製展示牆面
  drawGalleryWall();

  // 繪製飄浮粒子層
  updateAndDrawParticles();

  // Draw title text in top left
  fill(255);
  textAlign(LEFT, TOP);
  textSize(55);
  text("數位互動畫廊", 20, 20);

  // Draw subtitle text below title
  fill(200);
  textAlign(LEFT, TOP);
  textSize(18);
  text("滑鼠點擊可以進入畫作預覽", 24, 85);

  // Draw author text in top right
  fill(200);
  textAlign(RIGHT, TOP);
  textSize(30);
  text("414730100許豑云", width - 20, 30);

  // Draw perspective ground
  drawGround();

  // Calculate parallax offset based on mouse position
  let mouseFactor = map(mouseX, 0, width, -1, 1);
  parallaxOffset = mouseFactor * 80; // Reduced parallax offset for subtle effect

  // 繪製投射燈與陰影效果
  drawGalleryLighting();

  // Draw artworks
  drawArtworks();

  // 繪製滑鼠隨動光暈（手電筒效果）
  drawMouseGlow();
}

function drawGalleryWall() {
  // 牆面基底：深灰色混凝土質感
  background(wallColor);
  
  // 加入細微的雜訊顆粒感
  push();
  stroke(255, 15);
  for (let i = 0; i < 500; i++) {
    point(random(width), random(height * 0.7));
  }
  pop();

  // 牆面暗角與深景深感
  let wallGrad = drawingContext.createRadialGradient(width/2, height/3, 100, width/2, height/3, width);
  wallGrad.addColorStop(0, 'rgba(40, 40, 40, 0)');
  wallGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  drawingContext.fillStyle = wallGrad;
  rect(0, 0, width, height * 0.7);
}

function updateAndDrawParticles() {
  for (let p of particles) {
    p.update();
    p.display();
  }
}

function drawGround() {
  // 拋光地面：模擬拋光花崗岩
  let groundY = height * 0.7;
  let groundGrad = drawingContext.createLinearGradient(0, groundY, 0, height);
  groundGrad.addColorStop(0, '#151515'); // 銜接牆面的深處
  groundGrad.addColorStop(0.1, '#252525');
  groundGrad.addColorStop(1, '#050505'); // 近處變深
  
  drawingContext.fillStyle = groundGrad;
  noStroke();
  rect(0, groundY, width, height * 0.3);
  
  // 地面反光線
  stroke(255, 10);
  strokeWeight(1);
  line(0, groundY, width, groundY);
}

function drawArtworks() {
  let totalWidth = artworks.length * (thumbnailWidth + spacing) - spacing;
  let startX = (width - totalWidth) / 2 + parallaxOffset;

  // Check mouse position for selection and hover
  selectedArtwork = -1;
  hoveredArtwork = -1;
  for (let i = 0; i < artworks.length; i++) {
    let x = startX + i * (thumbnailWidth + spacing);
    let y = height / 2 - thumbnailHeight / 2;

    if (mouseX > x && mouseX < x + thumbnailWidth && mouseY > y && mouseY < y + thumbnailHeight) {
      hoveredArtwork = i;
      break;
    }
  }

  for (let i = 0; i < artworks.length; i++) {
    let x = startX + i * (thumbnailWidth + spacing);
    let y = height / 2 - thumbnailHeight / 2;

    // 繪製虛擬光束 (Spotlight Beams)
    drawSpotlightBeam(x, y, thumbnailWidth, thumbnailHeight);

    // Position thumbnail iframe
    let iframeElement = thumbnailIframes[i];
    iframeElement.style.left = x + 5 + 'px';
    iframeElement.style.top = y + 5 + 'px';
    iframeElement.style.width = (thumbnailWidth - 10) + 'px';
    iframeElement.style.height = (thumbnailHeight - 10) + 'px';

    // Metallic frame effect
    let isSelected = (i === selectedArtwork);
    let isHovered = (i === hoveredArtwork);
    let hasHoverEffect = (hoveredArtwork !== -1);
    drawMetallicFrame(x, y, thumbnailWidth, thumbnailHeight, isSelected, isHovered, hasHoverEffect);

    // 繪製地面反射 (Reflection)
    push();
    drawingContext.save();
    // 設置反射位置與翻轉
    translate(x + thumbnailWidth / 2, height * 0.7 + (height * 0.7 - y - thumbnailHeight));
    scale(1, -1); 
    // 反射透明度漸變
    let reflectionAlpha = isHovered ? 0.3 : 0.15;
    drawingContext.globalAlpha = reflectionAlpha;
    // 這裡繪製一個簡化的反射框
    fill(150);
    rect(-thumbnailWidth/2, 0, thumbnailWidth, thumbnailHeight, 5);
    drawingContext.restore();
    pop();

    // 美術館風格標籤卡 (Museum Label Card)
    drawMuseumLabel(x, y + thumbnailHeight + 15, thumbnailWidth, artworks[i].title);
  }
}

function drawMouseGlow() {
  push();
  // 使用 SCREEN 混合模式讓光暈具備加色提亮的視覺效果
  blendMode(SCREEN);
  let glowRadius = max(width, height) * 0.5;
  
  // 創建以滑鼠座標為中心的徑向漸層
  let mouseGrad = drawingContext.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
  mouseGrad.addColorStop(0, 'rgba(255, 255, 240, 0.15)'); // 增加中心亮度
  mouseGrad.addColorStop(0.4, 'rgba(255, 255, 240, 0.05)'); // 增加中段擴散亮度
  mouseGrad.addColorStop(1, 'rgba(255, 255, 240, 0)');     // 邊緣：完全透明

  drawingContext.fillStyle = mouseGrad;
  noStroke();
  rect(0, 0, width, height);
  pop();
}

function drawSpotlightBeam(x, y, w, h) {
  push();
  // 建立從頂部延伸到作品的線性漸層光束
  let beamGrad = drawingContext.createLinearGradient(x + w/2, 0, x + w/2, y + h);
  beamGrad.addColorStop(0, 'rgba(255, 255, 220, 0.1)'); // 頂部較亮（微黃暖光）
  beamGrad.addColorStop(0.5, 'rgba(255, 255, 220, 0.05)');
  beamGrad.addColorStop(1, 'rgba(255, 255, 220, 0)'); // 作品底部消失
  
  drawingContext.fillStyle = beamGrad;
  noStroke();
  // 繪製梯形光束
  beginShape();
  vertex(x + w/2 - 40, -50); 
  vertex(x + w/2 + 40, -50);
  vertex(x + w + 30, y + h);
  vertex(x - 30, y + h);
  endShape(CLOSE);
  pop();
}

function drawMuseumLabel(x, y, w, fullTitle) {
  // 解析標題：前四碼為日期 (MMDD)，後面為單元名稱
  let datePart = fullTitle.substring(0, 4);
  let titlePart = fullTitle.substring(4).trim();
  let cardW = w * 0.85;
  let cardH = 50;
  let cardX = x + (w - cardW) / 2;

  push();
  // 標籤卡白色本體與陰影
  fill(255);
  noStroke();
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = 'rgba(0,0,0,0.3)';
  rect(cardX, y, cardW, cardH, 2);
  drawingContext.shadowBlur = 0; // 關閉後續陰影

  // 文字繪製
  textAlign(LEFT, TOP);
  // 單元名稱
  fill(40);
  textSize(13);
  textStyle(BOLD);
  text(titlePart, cardX + 10, y + 10);
  
  // 作品日期 (更小且為灰色)
  fill(120);
  textSize(10);
  textStyle(NORMAL);
  let formattedDate = "2026 / " + datePart.substring(0, 2) + " / " + datePart.substring(2, 4);
  text(formattedDate, cardX + 10, y + 30);
  pop();
}

function drawMetallicFrame(x, y, w, h, isSelected = false, isHovered = false, hasHoverEffect = false) {
  // Save current drawing state
  push();

  // Apply blur effect for non-selected items when something is hovered
  if (hasHoverEffect && !isSelected && !isHovered) {
    // Simple blur simulation using transparency
    drawingContext.globalAlpha = 0.4;
  }

  // Scale effect for hovered item
  let scaleFactor = isHovered ? 1.05 : 1.0;
  let scaledW = w * scaleFactor;
  let scaledH = h * scaleFactor;
  let offsetX = (scaledW - w) / 2;
  let offsetY = (scaledH - h) / 2;

  // Outer shadow for depth
  fill(10);
  noStroke();
  rect(x - offsetX - 3, y - offsetY - 3, scaledW + 6, scaledH + 6, 5);

  // Main metallic frame - more refined wire-like effect
  for (let i = 0; i < 12; i++) {
    let inter = map(i, 0, 11, 0, 1);
    let c;
    if (isSelected || isHovered) {
      c = lerpColor(color(180, 180, 200), color(255, 255, 255), inter);
    } else {
      c = lerpColor(color(120, 120, 140), color(220, 220, 240), inter);
    }
    fill(c);
    rect(x - offsetX + i, y - offsetY + i, scaledW - 2 * i, scaledH - 2 * i, 2);
  }

  // Inner highlight - thinner wire effect
  if (isSelected || isHovered) {
    stroke(255, 255, 255, 250);
    strokeWeight(1);
  } else {
    stroke(255, 255, 255, 120);
    strokeWeight(0.5);
  }
  noFill();
  rect(x - offsetX + 3, y - offsetY + 3, scaledW - 6, scaledH - 6, 1);

  // Inner shadow - subtle
  stroke(0, 0, 0, 30);
  strokeWeight(0.5);
  rect(x - offsetX + 4, y - offsetY + 4, scaledW - 8, scaledH - 8, 0.5);

  // Neon glow at the bottom
  let glowColor;
  if (isSelected || isHovered) {
    glowColor = color(100, 200, 255, 150); // Bright blue glow
  } else {
    glowColor = color(50, 100, 150, 80); // Subtle blue glow
  }

  for (let i = 0; i < 5; i++) {
    let alpha = map(i, 0, 4, 50, 5);
    fill(glowColor.levels[0], glowColor.levels[1], glowColor.levels[2], alpha);
    noStroke();
    ellipse(x - offsetX + scaledW / 2, y - offsetY + scaledH + 10 + i * 2, scaledW * 0.8 - i * 4, 20 - i);
  }

  // Restore drawing state
  pop();
}

function drawGalleryLighting() {
  // 模擬展廳投射燈 (Spotlight)
  push();
  let spotlightGrad = drawingContext.createRadialGradient(width/2, height/2, 50, width/2, height/2, width*0.8);
  spotlightGrad.addColorStop(0, 'rgba(255, 255, 240, 0.15)'); // 中心亮
  spotlightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // 向外擴散消失
  drawingContext.fillStyle = spotlightGrad;
  rect(0, 0, width, height);
  pop();
}

function mousePressed() {
  // Calculate position to check which artwork was clicked
  let totalWidth = artworks.length * (thumbnailWidth + spacing) - spacing;
  let startX = (width - totalWidth) / 2 + parallaxOffset;

  for (let i = 0; i < artworks.length; i++) {
    let x = startX + i * (thumbnailWidth + spacing);
    let y = height / 2 - thumbnailHeight / 2;

    // Check if click is within artwork bounds
    if (mouseX > x && mouseX < x + thumbnailWidth && mouseY > y && mouseY < y + thumbnailHeight) {
      openArtwork(artworks[i]);
      return false; // Prevent default behavior
    }
  }
}

function openArtwork(artwork) {
  iframe.src = artwork.url;
  modal.style.display = "block";
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposition iframes
  drawArtworks();
}

// 粒子類別定義
class Particle {
  constructor() {
    // 讓粒子充滿整個畫布高度
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.2, 0.2), random(-0.2, 0.2));
    this.size = random(2, 5); // 加大粒子尺寸
    this.baseAlpha = random(30, 100); // 基準透明度
    this.alpha = this.baseAlpha;
  }

  update() {
    // 基礎漂浮運動
    this.pos.add(this.vel);

    // 邊界處理 (Wrap around)
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // 滑鼠互動：靠近時推開
    let mouse = createVector(mouseX, mouseY);
    let d = p5.Vector.dist(this.pos, mouse);
    
    if (d < 150) {
      let pushForce = p5.Vector.sub(this.pos, mouse);
      pushForce.normalize();
      // 距離越近推力越強
      let amt = map(d, 0, 150, 1.2, 0);
      this.pos.add(pushForce.mult(amt));
      
      // 閃爍效果：靠近時透明度隨機大幅跳動
      this.alpha = random(150, 255);
    } else {
      // 平滑恢復到原本淡淡的透明度
      this.alpha = lerp(this.alpha, this.baseAlpha, 0.1);
    }
    
    // 加入微小的隨機擾動感
    this.vel.add(p5.Vector.random2D().mult(0.01));
    this.vel.limit(0.5);
  }

  display() {
    noStroke();
    fill(255, this.alpha);
    circle(this.pos.x, this.pos.y, this.size);
  }
}
