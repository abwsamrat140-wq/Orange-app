@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&display=swap');

body {
    margin: 0;
    font-family: 'Cairo', sans-serif;
    background: linear-gradient(180deg, #ff7a00, #ffbb00);
    color: #fff;
    min-height: 100vh;
    /* تغيير الـ display ليتوافق مع الـ scrolling الطبيعي للـ footer */
    display: flex;
    flex-direction: column;
    justify-content: flex-start; /* بدء المحتوى من الأعلى */
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
}

/* تنسيق الرسالة الجديدة (Footer) */
.app-footer {
    width: 100%;
    max-width: 420px; /* لتكون بعرض الـ container */
    text-align: center;
    color: rgba(255, 255, 255, 0.95); /* لون واضح */
    font-size: 11px;
    font-weight: 600;
    padding: 15px 0 5px 0; /* مسافة بسيطة */
    /* تم إزالة position: fixed و backdrop-filter */
    margin-top: auto; /* لضمان دفعها للأسفل قدر الإمكان في الـ flex container */
}

.container {
    width: 100%;
    max-width: 420px;
    background: #fff;
    color: #333;
    border-radius: 22px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    overflow: hidden;
}

.header {
    background: linear-gradient(90deg,#ff7a00,#ff9a00);
    color: #fff;
    padding: 20px;
    border-bottom: 4px solid rgba(0,0,0,0.05);
    text-align: center;
}

.header h1 { margin: 0; font-size: 20px; }
.header p { margin: 6px 0 12px; font-size: 13px; opacity: 0.95; }

.dev-link {
    background: #fff;
    color: #ff7a00;
    text-decoration: none;
    padding: 8px 14px;
    border-radius: 18px;
    font-weight: 700;
    display: inline-block;
    transition: .2s;
}
.dev-link:hover { background: #ffb400; color: #fff; }

.menu {
    display:flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px;
}

.menu-btn {
    background: #ff7a00;
    color: #fff;
    border: none;
    border-radius: 14px;
    padding: 12px;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all .18s ease;
}
.menu-btn:hover { transform: translateY(-2px); background: #ff9100; }

.input-section, .loading, .result { display: none; padding: 18px; }
.input-group { margin-bottom: 12px; text-align: right; }
label { display:block; margin-bottom:6px; font-weight:700; color:#444; }
input[type="text"], input[type="password"] {
    width:100%; padding:10px; border-radius:10px; border: 2px solid #ffdfcc;
    font-size:14px; box-sizing: border-box;
}

.submit-btn {
    width:100%; background:#ff7a00; color:#fff; border:none; padding:12px; border-radius:14px;
    font-weight:700; cursor:pointer; font-size:16px;
}
.submit-btn:hover { background:#ff9a00; transform: scale(1.01); }

.back { margin-top:12px; background:#eee; color:#333; font-weight:700; }
.back:hover { background:#e0e0e0; }

.loading .spinner {
    width:56px; height:56px; border-radius:50%;
    border:6px solid #f0f0f0; border-top:6px solid #ff7a00; margin:14px auto; animation:spin 1s linear infinite;
}
#loadingText { text-align:center; color:#666; margin-top:8px; font-weight:700; }

.result .success {
    background:#e6ffed; color:#057a23; padding:12px; border-radius:10px; border:1px solid #aee5bb;
    font-weight:700; text-align:center;
}
.result .error {
    background:#fff0f0; color:#a80000; padding:12px; border-radius:10px; border:1px solid #ffb3b3;
    font-weight:700; text-align:center;
}

.danone-notice {
    background:#fff8e6; color:#6a4b00; padding:10px; border-radius:10px; margin-bottom:12px; border:1px solid #ffe6a8;
    font-size:13px; text-align:right;
}

@keyframes spin { to { transform: rotate(360deg); } }
