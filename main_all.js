
    const owner = "dymv14256";
    const repo = "movie";
    const branch = "main";
    const path_git = "https://dymv14256.github.io/movie/";

    function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 1500);
}

async function loadFolders(path, containerId) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url);
    const items = await res.json();

    if (!Array.isArray(items)) return;

    const container = document.getElementById(containerId);

    for (const item of items) {
        if (item.type === "dir") {
            const card = document.createElement("div");
            card.className = "folder-card";
            
            // Link ảnh logo
            const imgUrl = path_git + item.path + "/logo.webp";
            // Link folder
            const fullPath = path_git + item.path;

            card.innerHTML = `
                <img class="folder-thumb" src="${imgUrl}" alt="${item.name}">
                <div class="folder-name"><b>${item.name}</b></div>
                <div class="folder-actions">
                   <a target="_blank" href="${fullPath}">
                    <button class="btn-copy-name">
                    Mở
                    </button>
                    </a>
                </div>
            `;

            // Nút 1: Copy tên (item.name)
            card.querySelector(".btn-copy-name").onclick = (e) => {
                e.stopPropagation(); // Ngăn sự kiện nổi bọt nếu có
                navigator.clipboard.writeText(videoUrl);
                showToast("Đã copy video: " + videoUrl);
            };

            
            container.appendChild(card);
        }
    }
}

// ===== TẠO THUMBNAIL TỪ VIDEO =====
function createThumbnail(videoUrl) {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.muted = true;
        video.playsInline = true;

        video.addEventListener("loadeddata", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const thumb = canvas.toDataURL("image/jpeg");
            resolve(thumb);
        });

        video.addEventListener("error", () => {
            resolve(""); // fallback nếu lỗi
        });
    });
}
async function loadVideo(path, containerId) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
     const res = await fetch(url);
    if (!res.ok) {
        console.error("API lỗi:", res.status);
        return;
    }

    const items = await res.json();
    const container = document.getElementById("video-container");

    // lọc mp4 + sort t1 -> t9
    const videos = items
        .filter(item => item.type === "file" && item.name.endsWith(".mp4"))
        .sort((a, b) => {
            const n1 = parseInt(a.name.match(/\d+/)?.[0] || 0);
            const n2 = parseInt(b.name.match(/\d+/)?.[0] || 0);
            return n1 - n2;
        });

    for (const file of videos) {
        const videoUrl = file.download_url;

        const card = document.createElement("div");
        card.className = "video-card";

        const img = document.createElement("img");
        img.className = "thumb";

        const name = document.createElement("div");
        name.className = "video-name";
        name.textContent = file.name;

        const btn = document.createElement("button");
        btn.className = "btn-copy";
        btn.textContent = "Copy Link";

        btn.onclick = () => {
            navigator.clipboard.writeText(videoUrl);
            showToast("Đã copy video!");
        };

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(btn);
        container.appendChild(card);

        // 🔥 tạo thumbnail từ video
        const thumb = await createThumbnail(videoUrl);
        img.src = thumb || "";
    }
}
async function loadFiles(path, containerId, type) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;

    const res = await fetch(url);
    const files = await res.json();

    if (!Array.isArray(files)) {
        console.error("API error:", files);
        return;
    }

    const container = document.getElementById(containerId);

    files.forEach(file => {
        if (file.type === "file") {
            if (type === "image" && file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
                const img = document.createElement("img");
                img.src = file.download_url;

                img.onclick = () => {
                    navigator.clipboard.writeText(file.download_url);
                    showToast("Đã copy link ảnh!");
                };

                container.appendChild(img);
            }
            if (type === "video" && file.name.endsWith(".mp4")) {
                const video = document.createElement("video");
                video.src = file.download_url;
                video.controls = true;

                video.onclick = () => {
                    navigator.clipboard.writeText(file.download_url);
                    showToast("Đã copy link video!");
                };

                container.appendChild(video);
            }
        }
    });
} 