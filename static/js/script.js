document.addEventListener("DOMContentLoaded", function() {
    // 1. Inisialisasi AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: false,
        mirror: true
    });

    // Inisialisasi Observer untuk Animasi Quote Berulang saat Scroll
    setupQuoteScrollAnimation();
});

// 2. Fungsi Efek Mengetik Teks (Typewriter Effect yang Mulus)
function typeWriter(elementId, text, speed, callback) {
    let i = 0;
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = ""; // Bersihkan teks awal

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

// Variabel pengontrol animasi quote scroll
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
        threshold: 0.3 // Berjalan saat 30% bagian section terlihat di layar
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

// 3. Fungsi Membuka Undangan & Memicu Animasi Masuk
function openInvitation() {
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');

    // Munculkan konten utama di balik cover terlebih dahulu
    mainContent.classList.remove('hidden');
    
    // Putar musik latar
    if (bgMusic) {
        bgMusic.play().catch(error => {
            console.log("Autoplay dicegah oleh browser:", error);
        });
    }

    // Jalankan transisi geser cover dengan mulus menggunakan requestAnimationFrame
    requestAnimationFrame(() => {
        cover.style.transform = 'translateY(-100vh)';
        cover.style.transition = 'transform 0.6s cubic-bezier(0.77, 0, 0.175, 1)';
    });
    
    // Trigger animasi mengetik nama pasangan
    setTimeout(() => {
        typeWriter('typing-name', 'Cheppy & Febby', 80);
    }, 300);

    // Sembunyikan cover dari DOM dan refresh AOS setelah transisi selesai
    setTimeout(() => {
        cover.style.display = 'none';
        AOS.refresh();
    }, 600);
}

// 4. Countdown Timer (Hitung Mundur ke Tanggal 24 Desember 2026)
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

// 5. Fitur Lightbox Gallery (Popup Foto Fullscreen)
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

// 6. Fitur Salin Teks (Nomor Rekening / Alamat)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Berhasil disalin ke clipboard: " + text);
    }).catch(err => {
        console.error("Gagal menyalin teks: ", err);
    });
}

// 7. Logika Guestbook / Kirim Ucapan & Kehadiran
function submitMessage(event) {
    event.preventDefault();

    const nameInput = document.getElementById('guest-name');
    const msgInput = document.getElementById('guest-msg');
    const attendanceInput = document.getElementById('guest-attendance');
    const messageList = document.getElementById('message-list');

    const name = nameInput.value.trim();
    const message = msgInput.value.trim();
    const attendance = attendanceInput.value;

    if (!name || !message || !attendance) return;

    // Hapus teks "Belum ada ucapan..." jika itu elemen pertama
    const noMsgEl = messageList.querySelector('.no-message');
    if (noMsgEl) {
        noMsgEl.remove();
    }

    const timeString = new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newMessageCard = document.createElement('div');
    newMessageCard.className = 'message-card shadow';
    newMessageCard.setAttribute('data-aos', 'fade-up');
    
    const badgeClass = attendance === 'Hadir' ? 'badge-hadir' : 'badge-absent';

    newMessageCard.innerHTML = `
        <div class="msg-header">
            <h4 class="msg-name">
                ${escapeHtml(name)} <i class="fa-solid fa-circle-check verified-icon"></i>
            </h4>
            <div class="msg-actions">
                <span class="msg-time">Baru saja (${timeString})</span>
                <button onclick="this.closest('.message-card').remove(); updateCounters();" class="btn-delete" title="Hapus Komentar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        </div>
        <p class="msg-text">${escapeHtml(message)}</p>
        <div class="msg-footer">
            <span class="badge-attendance ${badgeClass}">${attendance}</span>
        </div>
    `;

    if (messageList.firstChild) {
        messageList.insertBefore(newMessageCard, messageList.firstChild);
    } else {
        messageList.appendChild(newMessageCard);
    }

    nameInput.value = '';
    msgInput.value = '';
    attendanceInput.selectedIndex = 0;

    updateCounters();
    AOS.refresh();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function updateCounters() {
    const messageList = document.getElementById('message-list');
    const cards = messageList ? messageList.querySelectorAll('.message-card') : [];
    
    const totalComments = document.getElementById('total-comments');
    if (totalComments) {
        totalComments.innerText = cards.length + " Comments";
    }

    let hadirCount = 0;
    let tidakHadirCount = 0;

    cards.forEach(card => {
        const badge = card.querySelector('.badge-attendance');
        if (badge) {
            if (badge.textContent.trim().toLowerCase() === 'hadir') {
                hadirCount++;
            } else {
                tidakHadirCount++;
            }
        }
    });

    setElementText("count-hadir", hadirCount);
    setElementText("count-tidak-hadir", tidakHadirCount);
}