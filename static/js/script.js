// Ganti dengan URL Web App Google Sheets Anda (berakhiran /exec)
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyYZtfc7Ai6clQtuds7RjumX-n98zogwK29FfZejldn4fnaiXf3DuN8xlz9bGtaxy2B/exec";

document.addEventListener("DOMContentLoaded", function() {
    // 1. Inisialisasi AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: false,
        mirror: true
    });

    setupQuoteScrollAnimation();

    // Otomatis isi nama tamu dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to');
    
    if (namaTamu) {
        const guestElement = document.getElementById('guest-name-display');
        if (guestElement) {
            guestElement.innerText = namaTamu;
        }
    }

    // Muat daftar ucapan dari Google Sheets saat halaman dibuka
    loadMessagesFromSheets();
});

// Fungsi Typewriter
function typeWriter(elementId, text, speed, callback) {
    let i = 0;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = "";

    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        } else if (callback) {
            callback();
        }
    }
    typing();
}

let quoteTimeout1 = null;
let quoteTimeout2 = null;
let isQuoteAnimating = false;

function setupQuoteScrollAnimation() {
    const quoteSection = document.querySelector(".quote-section");
    const quoteTextEl = document.getElementById("quote-text");
    const quoteAuthorEl = document.getElementById("quote-author");

    if (!quoteSection || !quoteTextEl || !quoteAuthorEl) return;

    const textContent = '"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang..."';
    const authorContent = "(QS. Ar-Rum : 21)";

    const observerOptions = {
        root: null,
        threshold: 0.3
    };

    const quoteObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!isQuoteAnimating && quoteTextEl.innerHTML.trim() === "") {
                    isQuoteAnimating = true;
                    quoteTextEl.innerHTML = "";
                    quoteAuthorEl.innerHTML = "";

                    let i = 0;
                    function typeText() {
                        if (i < textContent.length) {
                            quoteTextEl.innerHTML += textContent.charAt(i);
                            i++;
                            quoteTimeout1 = setTimeout(typeText, 25);
                        } else {
                            let j = 0;
                            function typeAuthor() {
                                if (j < authorContent.length) {
                                    quoteAuthorEl.innerHTML += authorContent.charAt(j);
                                    j++;
                                    quoteTimeout2 = setTimeout(typeAuthor, 40);
                                } else {
                                    isQuoteAnimating = false;
                                }
                            }
                            typeAuthor();
                        }
                    }
                    typeText();
                }
            } else {
                if (quoteTimeout1) clearTimeout(quoteTimeout1);
                if (quoteTimeout2) clearTimeout(quoteTimeout2);
                quoteTextEl.innerHTML = "";
                quoteAuthorEl.innerHTML = "";
                isQuoteAnimating = false;
            }
        });
    }, observerOptions);

    quoteObserver.observe(quoteSection);
}

function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');

    if (mainContent) mainContent.classList.remove('hidden');
    
    if (bgMusic) {
        bgMusic.play().catch(error => {
            console.log("Autoplay dicegah oleh browser:", error);
        });
    }

    requestAnimationFrame(() => {
        if (cover) {
            cover.style.transform = 'translateY(-100vh)';
            cover.style.transition = 'transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)';
        }
    });
    
    setTimeout(() => {
        typeWriter('typing-name', 'Cheppy & Fabiola', 80);
    }, 300);

    setTimeout(() => {
        if (cover) cover.style.display = 'none';
        AOS.refresh();
    }, 600);
}

// Countdown Timer
const weddingDate = new Date("December 24, 2026 14:00:00").getTime();

const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    if (distance < 0) {
        clearInterval(timerInterval);
        const timerEl = document.getElementById("timer");
        if (timerEl) {
            timerEl.innerHTML = "<h3 class='font-aesthetic'>Acara Sedang Berlangsung</h3>";
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setElementText("days", days);
    setElementText("hours", hours);
    setElementText("minutes", minutes);
    setElementText("seconds", seconds);
}, 1000);

function setElementText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function openLightbox(element) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("lightboxImage");
    const img = element.querySelector("img");

    if (modal && modalImg && img) {
        modal.style.display = "flex";
        modalImg.src = img.src;
    }
}

function closeLightbox() {
    const modal = document.getElementById("imageModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Berhasil disalin ke clipboard: " + text);
    }).catch(err => {
        console.error("Gagal menyalin teks: ", err);
    });
}

// --- LOGIKA GUESTBOOK PUBLIC REAL-TIME DENGAN GOOGLE SHEETS ---

// 1. Fungsi untuk mengambil dan merender daftar ucapan dari Google Sheets
function loadMessagesFromSheets() {
    const messageList = document.getElementById('message-list');
    if (!messageList) return;

    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            messageList.innerHTML = '';

            if (!data || data.length === 0) {
                messageList.innerHTML = '<p class="no-message" style="color: #fff; font-size: 0.85rem; font-style: italic; padding: 10px;">Belum ada ucapan. Jadilah yang pertama memberikan ucapan!</p>';
                return;
            }

            // Balik urutan data agar ucapan terbaru berada di posisi paling atas
            data.reverse();

            data.forEach(item => {
                const badgeClass = item.kehadiran === 'Hadir' ? 'badge-hadir' : 'badge-absent';
                const card = document.createElement('div');
                card.className = 'message-card shadow';
                card.style.cssText = "background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px; text-align: left; color: #333;";

                card.innerHTML = `
                    <div class="msg-header" style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <h4 class="msg-name" style="margin: 0; font-weight: bold; color: #7d4f46;">
                            ${escapeHtml(item.nama)} <i class="fa-solid fa-circle-check verified-icon" style="color: #28a745; font-size: 0.8rem;"></i>
                        </h4>
                        <span class="msg-time" style="font-size: 0.75rem; color: #888;">${item.time || ''}</span>
                    </div>
                    <p class="msg-text" style="margin: 5px 0 10px 0; font-size: 0.9rem; word-break: break-word;">${escapeHtml(item.ucapan)}</p>
                    <div class="msg-footer">
                        <span class="badge-attendance ${badgeClass}" style="font-size: 0.75rem; padding: 2px 8px; border-radius: 4px; background: ${item.kehadiran === 'Hadir' ? '#d4edda' : '#f8d7da'}; color: ${item.kehadiran === 'Hadir' ? '#155724' : '#721c24'};">${item.kehadiran}</span>
                    </div>
                `;
                messageList.appendChild(card);
            });
        })
        .catch(err => {
            console.error("Gagal memuat ucapan:", err);
        });
}

// 2. Fungsi untuk mengirim ucapan baru ke Google Sheets tanpa error CORS
async function submitToGoogleSheets(event) {
    event.preventDefault(); // Mencegah halaman reload

    const form = event.target;
    const btnSubmit = document.getElementById('btn-submit-form');
    const successMsg = document.getElementById('success-msg');

    const nama = document.getElementById('input-nama-pengirim').value.trim();
    const ucapan = document.getElementById('guest-msg').value.trim();
    const kehadiran = document.getElementById('guest-attendance').value;

    if (!nama || !ucapan || !kehadiran) return;

    if (btnSubmit) {
        btnSubmit.innerText = "Mengirim...";
        btnSubmit.disabled = true;
    }

    const timeString = new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    const id = 'msg_' + Date.now();

    const payload = {
        nama: nama,
        ucapan: ucapan,
        kehadiran: kehadiran,
        time: timeString,
        id: id
    };

    fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // INI KUNCINYA agar browser lokal tidak memblokir koneksi ke Google
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(() => {
        form.reset(); // Kosongkan form
        if (btnSubmit) {
            btnSubmit.innerText = "Kirim";
            btnSubmit.disabled = false;
        }

        if (successMsg) {
            successMsg.style.display = "block";
            setTimeout(() => { successMsg.style.display = "none"; }, 4000);
        }

        // Beri jeda 1 detik agar data masuk dulu ke sheets, lalu muat ulang
        setTimeout(() => {
            loadMessagesFromSheets();
        }, 1000);
    })
    .catch(error => {
        console.error("Gagal mengirim:", error);
        alert("Gagal mengirim ucapan, periksa koneksi internet Anda.");
        if (btnSubmit) {
            btnSubmit.innerText = "Kirim";
            btnSubmit.disabled = false;
        }
    });
}

// Fungsi pengaman karakter HTML agar terhindar dari error/inject
function escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.toString().replace(/[&<>"']/g, function(m) { return map[m]; });
}
