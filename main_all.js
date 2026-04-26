
    const owner = "DYMV14256";
    const repo = "movie";
    const branch = "main";
    const path_git = "https://DYMV14256.github.io/movie/";

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
async function loadVideo(path, containerId) {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(url);
    const items = await res.json();

    if (!Array.isArray(items)) return;

    const container = document.getElementById(containerId);

    for (const item of items) {
        if (item.type === "dir") {

            // Lấy danh sách file trong folder đó
            const subUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`;
            const subRes = await fetch(subUrl);
            const subItems = await subRes.json();

            if (!Array.isArray(subItems)) continue;

            // Tìm file mp4
            const videoFile = subItems.find(f => 
                f.type === "file" && f.name.endsWith(".mp4")
            );

            if (!videoFile) continue; // bỏ folder không có video

            const videoUrl = videoFile.download_url;

            const card = document.createElement("div");
            card.className = "folder-card";

            card.innerHTML = `
                <video class="folder-video" src="${videoUrl}" controls muted></video>
                <div class="folder-name"><b>${item.name}</b></div>
                <button class="btn-copy-video">Copy Video</button>
            `;

            // copy link video
            card.querySelector(".btn-copy-video").onclick = (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(videoUrl);
                showToast("Đã copy video!");
            };

            container.appendChild(card);
        }
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