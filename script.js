/* ==========================================
   Mother's Memory App
   Vanilla JavaScript
========================================== */


const photoInput = document.getElementById("photoInput");

const galleryGrid = document.getElementById("galleryGrid");

const emptyGallery = document.getElementById("emptyGallery");

const imageModal = document.getElementById("imageModal");

const modalImage = document.getElementById("modalImage");

const closeModal = document.getElementById("closeModal");

const prevImage = document.getElementById("prevImage");

const nextImage = document.getElementById("nextImage");

const deleteImage = document.getElementById("deleteImage");

const imageCounter = document.getElementById("imageCounter");

const noteInput = document.getElementById("noteInput");

const saveNote = document.getElementById("saveNote");

const saveStatus = document.getElementById("saveStatus");

const themeBtn = document.getElementById("themeBtn");

const heartsContainer = document.getElementById("hearts");


/* ==========================================
   IndexedDB
========================================== */

const DB_NAME = "MotherMemoryDB";

const DB_VERSION = 1;

const STORE_NAME = "photos";

let db;

let photos = [];

let currentImageIndex = 0;


/* Open database */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open(DB_NAME, DB_VERSION);


        request.onupgradeneeded = function(event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {

                database.createObjectStore(
                    STORE_NAME,
                    {
                        keyPath: "id",
                        autoIncrement: true
                    }
                );

            }

        };


        request.onsuccess = function(event) {

            db = event.target.result;

            resolve(db);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* ==========================================
   Get Photos
========================================== */

function getPhotos() {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            transaction.objectStore(STORE_NAME);

        const request = store.getAll();


        request.onsuccess = function() {

            resolve(request.result);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* ==========================================
   Add Photo
========================================== */

function addPhoto(photo) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.add(photo);


        request.onsuccess = function() {

            resolve(request.result);

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* ==========================================
   Delete Photo
========================================== */

function removePhoto(id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            transaction.objectStore(STORE_NAME);

        const request =
            store.delete(id);


        request.onsuccess = function() {

            resolve();

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}


/* ==========================================
   Render Gallery
========================================== */

async function renderGallery() {

    photos = await getPhotos();

    galleryGrid.innerHTML = "";


    if (photos.length === 0) {

        emptyGallery.style.display = "block";

        return;

    }


    emptyGallery.style.display = "none";


    photos.forEach((photo, index) => {

        const card =
            document.createElement("div");

        card.className = "photo-card";


        const img =
            document.createElement("img");

        img.src =
            URL.createObjectURL(photo.file);

        img.alt =
            "خاطره شماره " + (index + 1);


        const overlay =
            document.createElement("div");

        overlay.className = "photo-overlay";


        const text =
            document.createElement("span");

        text.className = "view-photo";

        text.textContent =
            "مشاهده عکس";


        overlay.appendChild(text);

        card.appendChild(img);

        card.appendChild(overlay);


        card.addEventListener("click", () => {

            openModal(index);

        });


        galleryGrid.appendChild(card);

    });

}


/* ==========================================
   Upload Photos
========================================== */

photoInput.addEventListener("change", async function(event) {

    const files =
        Array.from(event.target.files);


    if (!files.length) {
        return;
    }


    for (const file of files) {

        if (!file.type.startsWith("image/")) {
            continue;
        }


        const photo = {

            file: file,

            createdAt: Date.now()

        };


        try {

            await addPhoto(photo);

        } catch (error) {

            console.error(
                "خطا در ذخیره عکس:",
                error
            );

        }

    }


    await renderGallery();


    photoInput.value = "";

});


/* ==========================================
   Modal
========================================== */

function openModal(index) {

    if (!photos.length) {
        return;
    }


    currentImageIndex = index;

    updateModal();


    imageModal.classList.add("active");

    document.body.style.overflow = "hidden";

}


function updateModal() {

    const photo =
        photos[currentImageIndex];


    if (!photo) {
        return;
    }


    const url =
        URL.createObjectURL(photo.file);


    modalImage.src = url;


    imageCounter.textContent =
        `${currentImageIndex + 1} / ${photos.length}`;

}


function closeImageModal() {

    imageModal.classList.remove("active");

    document.body.style.overflow = "";

}


closeModal.addEventListener(
    "click",
    closeImageModal
);


imageModal.addEventListener(
    "click",
    function(event) {

        if (event.target === imageModal) {

            closeImageModal();

        }

    }
);


/* ==========================================
   Previous / Next
========================================== */

prevImage.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        if (!photos.length) {
            return;
        }


        currentImageIndex--;

        if (currentImageIndex < 0) {

            currentImageIndex =
                photos.length - 1;

        }


        updateModal();

    }
);


nextImage.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        if (!photos.length) {
            return;
        }


        currentImageIndex++;

        if (
            currentImageIndex >=
            photos.length
        ) {

            currentImageIndex = 0;

        }


        updateModal();

    }
);


/* ==========================================
   Delete Current Photo
========================================== */

deleteImage.addEventListener(
    "click",
    async function(event) {

        event.stopPropagation();


        const photo =
            photos[currentImageIndex];


        if (!photo) {
            return;
        }


        const confirmed =
            confirm(
                "مطمئنی می‌خوای این عکس رو حذف کنی؟ ❤️"
            );


        if (!confirmed) {
            return;
        }


        await removePhoto(photo.id);


        photos =
            await getPhotos();


        if (photos.length === 0) {

            closeImageModal();

        } else {

            if (
                currentImageIndex >=
                photos.length
            ) {

                currentImageIndex =
                    photos.length - 1;

            }

            updateModal();

        }


        await renderGallery();

    }
);


/* ==========================================
   Keyboard Navigation
========================================== */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            !imageModal.classList.contains("active")
        ) {
            return;
        }


        if (event.key === "Escape") {

            closeImageModal();

        }


        if (event.key === "ArrowLeft") {

            nextImage.click();

        }


        if (event.key === "ArrowRight") {

            prevImage.click();

        }

    }
);


/* ==========================================
   Notes
========================================== */

const savedNote =
    localStorage.getItem("motherNote");


if (savedNote) {

    noteInput.value = savedNote;

    saveStatus.textContent =
        "یادداشت ذخیره شده ❤️";

}


saveNote.addEventListener(
    "click",
    function() {

        const text =
            noteInput.value.trim();


        if (!text) {

            saveStatus.textContent =
                "اول چیزی برای مامان بنویس 🌷";

            return;

        }


        localStorage.setItem(
            "motherNote",
            text
        );


        saveStatus.textContent =
            "یادداشت با موفقیت ذخیره شد ❤️";


        saveButtonAnimation();

    }
);


function saveButtonAnimation() {

    saveNote.textContent =
        "ذخیره شد ✓";


    setTimeout(() => {

        saveNote.textContent =
            "ذخیره یادداشت ❤️";

    }, 1800);

}


/* ==========================================
   Dark Mode
========================================== */

const savedTheme =
    localStorage.getItem("motherTheme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

}


themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        if (isDark) {

            themeBtn.textContent = "☀️";

            localStorage.setItem(
                "motherTheme",
                "dark"
            );

        } else {

            themeBtn.textContent = "🌙";

            localStorage.setItem(
                "motherTheme",
                "light"
            );

        }

    }
);


/* ==========================================
   Floating Hearts
========================================== */

function createHeart() {

    const heart =
        document.createElement("span");


    heart.className =
        "floating-heart";


    heart.textContent =
        Math.random() > 0.5
            ? "♥"
            : "♡";


    heart.style.left =
        Math.random() * 100 + "%";


    heart.style.fontSize =
        12 + Math.random() * 20 + "px";


    heart.style.animationDuration =
        8 + Math.random() * 10 + "s";


    heartsContainer.appendChild(heart);


    setTimeout(() => {

        heart.remove();

    }, 18000);

}


setInterval(
    createHeart,
    1400
);


/* ==========================================
   Touch Swipe
========================================== */

let touchStartX = 0;


imageModal.addEventListener(
    "touchstart",
    function(event) {

        touchStartX =
            event.touches[0].clientX;

    },
    { passive: true }
);


imageModal.addEventListener(
    "touchend",
    function(event) {

        const touchEndX =
            event.changedTouches[0].clientX;


        const difference =
            touchStartX - touchEndX;


        if (Math.abs(difference) < 50) {
            return;
        }


        if (difference > 0) {

            nextImage.click();

        } else {

            prevImage.click();

        }

    },
    { passive: true }
);


/* ==========================================
   Start Application
========================================== */

async function init() {

    try {

        await openDatabase();

        await renderGallery();

    } catch (error) {

        console.error(
            "خطا در راه‌اندازی برنامه:",
            error
        );

        emptyGallery.innerHTML = `
            <div class="empty-icon">⚠️</div>
            <h3>خطایی رخ داد</h3>
            <p>
                مرورگر شما اجازه ذخیره عکس‌ها را نداده است.
            </p>
        `;

    }

}


init();