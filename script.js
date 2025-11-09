// const PROXY_URL = '...'; // <-- تم حذف هذا السطر، لم نعد بحاجته

// =================== الثوابت من كود البايثون =====================
const SECRET_STRING = ",{.c][o^uecnlkijh*.iomv:QzCFRcd;drof/zx}w;ls.e85T^#ASwa?=(lk";
const CHANNEL_DATA = '{"channel":{"ChannelName":"MobinilAndMe","Password":"ig3yh*mk5l42@oj7QAR8yF"}}';
const APP_VERSION = "9.0.1";

// =================== (تحديث) الروابط لتعمل مع Netlify =====================
const URLS = {
    // استخدم /api/ لأي شيء يذهب إلى services.orange.eg
    TOKEN: "/api/GetToken.svc/GenerateToken",
    SIGNIN: "/api/SignIn.svc/SignInUser",
    GENERATE_BASIC_TOKEN: "/api/APIs/Profile/api/BasicAuthentication/Generate",
    FORGOT_PASS: "/api/ProfileService.svc/ForgotPassword",
    REDEEM_RAMADAN: "/api/APIs/Promotions/api/CAF/Redeem",
    REDEEM_DANONE: "/api/APIs/Promotions/api/Danone/RedVoucher",
    FAWAZEER_QUESTIONS: "/api/APIs/Ramadan2024/api/RamadanOffers/Fawazeer/Questions",
    FAWAZEER_SUBMIT: "/api/APIs/Ramadan2024/api/RamadanOffers/Fawazeer/Submit",

    // استخدم /api-merida/ لخدمة Merida
    MERIDA: "/api-merida/api/speedRedeemOffer",

    // استخدم /api-balance/ لخدمة الرصيد
    BALANCE_CHECK: "/api-balance/apis/gsm/gsmonlinepayment/api/payment/rechargecheckeligibilityForOthers" 
};


let currentService = '';

// =================== دوال التحكم بالواجهة (كما هي) =====================

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('danoneNotice').style.display = 'none';
}

function showInput(service) {
    currentService = service;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    const requiresPassword = ['ramadan', 'fawazeer', 'danone'].includes(service);
    document.getElementById('passwordGroup').style.display = requiresPassword ? 'block' : 'none';
    document.getElementById('danoneNotice').style.display = (service === 'danone') ? 'block' : 'none';
    document.getElementById('inputLabel').textContent = {
        'merida': 'رقم الهاتف لتفعيل عرض 1000 ميجا',
        'ramadan': 'رقم الهاتف لتفعيل عرض 500 ميجا',
        'fawazeer': 'رقم الهاتف لتفعيل عرض 250 ميجا فوازير',
        'danone': 'رقم الهاتف لتخمين عرض 250 ميجا دانون',
        'balance': 'رقم الهاتف لمعرفة الرصيد',
        'password': 'رقم الهاتف لاسترجاع كلمة المرور'
    }[service];
    document.getElementById('submitBtn').textContent = (service === 'balance' || service === 'password') ? 'طلب' : 'تفعيل';
    document.getElementById('phoneInput').value = '';
    document.getElementById('passwordInput').value = '';
}

function showLoading(text = 'جاري المعالجة... ⏳') {
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingText').textContent = text;
}

function showResult(message, type = 'success') {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultMessage').innerHTML = `<div class="${type}">${message}</div>`;
}

// =================== دالة الاتصال الرئيسية (كما هي) =====================
async function makeRequest(url, options = {}) {
    try {
        const defaultOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                'User-Agent': 'Mozilla/5.0'
            },
            ...options
        };
        if (options.headers && options.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
             // لا تقم بتحويل الـ body إلى JSON
        } else if (defaultOptions.body && typeof defaultOptions.body !== 'string') {
            defaultOptions.body = JSON.stringify(defaultOptions.body);
        }
        
        // لا نحتاج لـ PROXY_URL هنا لأن الروابط أصبحت نسبية
        const response = await fetch(url, defaultOptions); 
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            return text; 
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}

// =================== دوال الخدمات (محدثة) =====================

// Merida - 1000 ميجا
async function processMerida(phone) {
    try {
        showLoading('جاري تفعيل عرض 1000 ميجا...');
        const payload = new URLSearchParams({ msisdn: phone, lang: "ar" });
        const headers = {
            'User-Agent': 'Mozilla/5.0',
            'Origin': 'https://speed.meridagame.com', // Origin مهم لـ Merida
            'Referer': 'https://speed.meridagame.com/',
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        // ملاحظة: fetch مع URL نسبي سيتجاهل Origin/Referer لكن البروكسي سيتكفل بذلك
        const response = await fetch(URLS.MERIDA, {
            method: 'POST',
            headers: headers,
            body: payload
        });
        
        // Merida لا تستجيب بـ JSON قياسي دائماً
        let data;
        try {
            data = await response.json();
        } catch(e) {
             const text = await response.text();
             console.log("Merida non-json response:", text);
             throw new Error(text || "Merida response error");
        }

        const msg = data?.data?.redeemOutputs?.RedeemErrorDoc?.errDesc || "Success";
        if (msg.toLowerCase() === "success") {
            return { success: true, message: "✅ مبرووووك! تم تفعيل عرض 1000 ميجا بنجاح\n@alturky_2006" };
        } else if (msg.includes("capping capacity")) {
            return { success: false, message: "⚠️ حصلت على العرض مسبقاً 😥", type: 'warning' };
        } else {
            return { success: false, message: `🔴 ${msg}` };
        }
    } catch (e) {
        return { success: false, message: "🔴 خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً." };
    }
}

// Forgot Password (مُصحح)
async function processForgotPassword(phone) {
    try {
        showLoading('جاري طلب كلمة المرور الجديدة...');
        
        const tokenHeaders = {
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'okhttp/3.14.9' 
        };
        const tokenData = await makeRequest(URLS.TOKEN, { headers: tokenHeaders, body: CHANNEL_DATA });
        
        if (!tokenData?.GenerateTokenResult?.Token) {
            return { success: false, message: "🔴 فشل في الاتصال بخادم اورانج (Token)" };
        }
        const ctv = tokenData.GenerateTokenResult.Token;
        const htv = await generateSHA256(ctv + SECRET_STRING);
        
        const payload = { "channel": { "ChannelName": "MobinilAndMe", "Password": "ig3yh*mk5l42@oj7QAR8yF" }, "dialNumber": phone, "lang": "ar" };
        const headers = {
            '_ctv': ctv,
            '_htv': htv,
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'okhttp/3.14.9'
        };

        const response = await makeRequest(URLS.FORGOT_PASS, { headers: headers, body: payload });
        const text = typeof response === 'string' ? response : JSON.stringify(response);
        
        if (text.includes("user data is null") || text.includes("UserDataIsNull")) {
            return { success: false, message: "🔴 الرقم غير مسجل في خدمة اورانج" };
        } else if (text.toLowerCase().includes("success")) {
            return { success: true, message: "✅ تم إرسال كلمة المرور الجديدة في رسالة نصية إلى هاتفك" };
        } else {
            return { success: false, message: "⚠️ لا يمكن استرجاع كلمة المرور حالياً. حاول لاحقاً" };
        }
    } catch (e) {
        return { success: false, message: "🔴 فشل في الاتصال بالخادم. تأكد من اتصالك بالإنترنت" };
    }
}

// Ramadan 500 ميجا (مُصحح)
async function processRamadan(phone, password) {
    try {
        showLoading('جاري تسجيل الدخول...');
        const signInResult = await signInOrange(phone, password);
        if (!signInResult.success) {
            return { success: false, message: "🔴 خطأ في تسجيل الدخول. تأكد من الرقم وكلمة المرور." };
        }
        
        const tokenHeaders = {
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'okhttp/3.14.9' 
        };
        const tokenData = await makeRequest(URLS.TOKEN, { headers: tokenHeaders, body: CHANNEL_DATA });
        if (!tokenData?.GenerateTokenResult?.Token) {
            return { success: false, message: "🔴 فشل في الحصول على التوكن (ctv)" };
        }
        const ctv = tokenData.GenerateTokenResult.Token;
        const htv = await generateSHA256(ctv + SECRET_STRING);

        showLoading('جاري تفعيل عرض 500 ميجا...');
        const payload = {
            "Language": "ar", "OSVersion": "Android7.0", "PromoCode": "رمضان كريم",
            "dial": phone, "password": password,
            "Channelname": "MobinilAndMe", "ChannelPassword": "ig3yh*mk5l42@oj7QAR8yF"
        };
        const headers = {
            '_ctv': ctv,
            '_htv': htv,
            'UserId': signInResult.userId,
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'okhttp/3.14.9'
        };

        const result = await makeRequest(URLS.REDEEM_RAMADAN, { headers: headers, body: payload });
        const errorDesc = result?.ErrorDescription || '';
        const errorCode = result?.ErrorCode || -1;
        
        if (errorCode === 0) {
            return { success: true, message: "✅ مبرووووك! تم تفعيل عرض 500 ميجا اورانج بنجاح." };
        } else if (errorDesc.includes("تم الاستخدام")) {
            return { success: false, message: "⚠️ لقد استخدمت العرض مسبقاً", type: 'warning' };
        } else {
            return { success: false, message: `🔴 ${errorDesc || 'فشل التفعيل'}` };
        }
    } catch (e) {
        return { success: false, message: "🔴 حدث خطأ في الاتصال بالخادم. حاول لاحقاً" };
    }
}

// Fawazeer 250 ميجا
async function processFawazeer(phone, password) {
    try {
        showLoading('جاري تسجيل الدخول...');
        
        const signInResult = await signInOrangeFull(phone, password);
        if (!signInResult.success) {
            return { success: false, message: "🔴 فشل تسجيل الدخول. تحقق من الرقم وكلمة المرور" };
        }
        
        const headers = {
            'User-Agent': "Mozilla/5.0", // سيقوم البروكسي بتمريره
            'Accept': "application/json, text/plain, */*",
            'Content-Type': "application/json",
            'Origin': "https://services.orange.eg",
            'X-Requested-With': "com.orange.mobinilandmf",
        };

        showLoading('جاري الحصول على أسئلة الفوازير...');
        const questionsPayload = { "Dial": phone, "Language": "ar", "Token": signInResult.basicToken };
        const questionsResponse = await makeRequest(URLS.FAWAZEER_QUESTIONS, { headers: headers, body: questionsPayload });

        if (questionsResponse?.ErrorCode === 1) {
            return { success: false, message: "⚠️ لقد شاركت اليوم. حاول غداً", type: 'warning' };
        }
        const questions = questionsResponse?.Questions || [];
        if (questions.length === 0) {
            return { success: false, message: "⚠️ لا توجد أسئلة فوازير الآن" };
        }

        const answers = questions.map(q => ({
            QuestionId: q.Answers.find(a => a.IsCorrect).QuestionId,
            AnswerId: q.Answers.find(a => a.IsCorrect).Id
        }));

        showLoading('جاري إرسال الإجابات...');
        const submitPayload = { "Dial": phone, "Language": "ar", "Token": signInResult.basicToken, "Answers": answers };
        const submitResult = await makeRequest(URLS.FAWAZEER_SUBMIT, { headers: headers, body: submitPayload });

        if (submitResult?.ErrorDescription === "FawazeerSuccess") {
            return { success: true, message: "✅ مبروووك! تم إضافة 250 ميجا بنجاح 🎉" };
        } else {
            return { success: false, message: `🔴 فشل الإرسال: ${submitResult?.ErrorDescription || 'خطأ غير معروف'}`, type: 'error' };
        }
    } catch (e) {
        return { success: false, message: "🔴 خدمة الفوازير غير متاحة حالياً" };
    }
}

// Danone (تخمين)
async function processDanone(phone, password) {
    showLoading('جاري تسجيل الدخول لتفعيل دانون...');
    
    const signInResult = await signInOrangeFull(phone, password);
    if (!signInResult.success) {
        return { success: false, message: "🔴 فشل تسجيل الدخول. تأكد من الرقم وكلمة المرور" };
    }

    const headers = {
        'User-Agent': "Mozilla/5.0",
        'Accept': "application/json, text/plain, */*",
        'Content-Type': "application/json",
        'Origin': "https://services.orange.eg",
        'X-Requested-With': "com.orange.mobinilandmf",
    };

    for (let i = 1; i <= 10; i++) {
        const code = Math.floor(10000000 + Math.random() * 90000000).toString();
        showLoading(`جاري تجربة الكود ${i} من 10... ⏳\n(${code})`);
        
        const payload = {
            "Dial": phone,
            "Language": "ar",
            "Token": signInResult.basicToken,
            "VoucherCode": code
        };

        try {
            const result = await makeRequest(URLS.REDEEM_DANONE, { headers: headers, body: payload });
            if (result?.ErrorCode === 0) {
                return { success: true, message: `✅ مبروووك! تم شحن الكود بنجاح: ${code}` };
            } else {
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (e) {
            console.warn(`Code ${code} failed:`, e);
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return { 
        success: false, 
        message: '❌ انتهت الـ 10 محاولات.\nلقد أخذت الهدية اليوم أو الأكواد غير صالحة.', 
        type: 'error' 
    };
}

// Balance Check
async function processBalance(phone) {
    showLoading('جاري الاستعلام عن الرصيد...');
    try {
        const payload = {"SelectedUserDial":null,"IsForAnotherRecipient":true,"RecipientDial":phone,"Dial":phone};
        const headers = {
            'User-Agent':'Mozilla/5.0',
            'Accept':'application/json, text/plain, */*',
            'Content-Type':'application/json',
            'lang':'ar',
            'Origin':'https://www.orange.eg',
            'Referer':'https://www.orange.eg/en/myaccount/pay-bill-or-recharge-for-others'
        };
        const result = await makeRequest(URLS.BALANCE_CHECK, { headers: headers, body: payload });
        if (result?.ErrorCode === 0) {
            const balance = result.CreditBalance || 0;
            return { success: true, message: `✅ الرصيد الحالي: **${balance}** جنيه` };
        } else {
            const errorDesc = result?.ErrorDescription || 'خطأ غير معروف';
            return { success: false, message: `🔴 فشل الاستعلام: ${errorDesc}` };
        }
    } catch (e) {
        return { success: false, message: "🔴 فشل الاتصال بخادم الرصيد. حاول لاحقاً." };
    }
}


// =================== دوال مساعدة (محدثة بالـ Headers) =====================

// دالة تسجيل الدخول الأساسية (SignInUser) (مطابقة للبايثون)
async function signInOrange(number, password) {
    try {
        const payload = {
            "appVersion": APP_VERSION,
            "channel": { "ChannelName": "MobinilAndMe", "Password": "ig3yh*mk5l42@oj7QAR8yF" },
            "dialNumber": number,
            "isAndroid": true,
            "lang": "ar",
            "password": password
        };
        const headers = {
            'User-Agent': "okhttp/4.10.0",
            'Content-Type': "application/json; charset=UTF-8",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip"
        };
        
        const data = await makeRequest(URLS.SIGNIN, { headers: headers, body: payload });
        const result = data?.SignInUserResult;
        
        if (result?.AccessToken && result?.ErrorCode === 0) {
            return { success: true, userId: result.UserData?.UserID, accessToken: result.AccessToken };
        } else {
            throw new Error(result?.ErrorDescription || 'بيانات الدخول غير صحيحة');
        }
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// دالة تسجيل الدخول الكاملة (Generate Basic Auth Token) (مُصححة)
async function signInOrangeFull(number, password) {
    try {
        const basicSignIn = await signInOrange(number, password);
        if (!basicSignIn.success) {
            return { success: false, message: "خطأ في الخطوة الأولى (SignIn)" };
        }

        const payload = {
            "ChannelName": "MobinilAndMe", "ChannelPassword": "ig3yh*mk5l42@oj7QAR8yF",
            "Dial": number, "Language": "ar", "Module": "0", "Password": password
        };
        
        const headers = {
            'User-Agent': "okhttp/4.10.0",
            'Connection': "Keep-Alive",
            'Accept-Encoding': "gzip",
            'Content-Type': "application/json; charset=UTF-8",
            'AppVersion': APP_VERSION,
            'OsVersion': "13",
            'IsAndroid': "true",
            'IsEasyLogin': "false",
            'Token': basicSignIn.accessToken 
        };

        const response = await makeRequest(URLS.GENERATE_BASIC_TOKEN, { headers: headers, body: payload });
        const basicToken = response?.Token;
        
        if (basicToken) {
            return { success: true, basicToken: basicToken, accessToken: basicSignIn.accessToken, userId: basicSignIn.userId };
        } else {
            return { success: false, message: "خطأ في الخطوة الثانية (GenerateToken)" };
        }
    } catch (e) {
        return { success: false, error: e };
    }
}

// دالة SHA256 (كما هي)
async function generateSHA256(text) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    } catch (e) {
        console.error("SHA256 Error:", e);
        return 'HASH_ERROR';
    }
}

// =================== المتحكم الرئيسي بالطلبات (كما هو) =====================
async function processRequest() {
    const phone = document.getElementById('phoneInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!phone) {
        return showResult('⚠️ يرجى إدخال رقم الهاتف', 'error');
    }
    
    const requiresPassword = ['ramadan', 'fawazeer', 'danone'].includes(currentService);
    if (requiresPassword && !password) {
        return showResult('⚠️ يرجى إدخال كلمة المرور', 'error');
    }
    
    showLoading();
    
    try {
        let result;
        switch (currentService) {
            case 'merida':
                result = await processMerida(phone);
                break;
            case 'ramadan':
                result = await processRamadan(phone, password);
                break;
            case 'fawazeer':
                result = await processFawazeer(phone, password);
                break;
            case 'danone':
                result = await processDanone(phone, password);
                break;
            case 'balance':
                result = await processBalance(phone);
                break;
            case 'password':
                result = await processForgotPassword(phone);
                break;
            default:
                result = { success: false, message: '⚠️ الخدمة غير معروفة' };
        }
        showResult(result.message, result.success ? 'success' : result.type || 'error');
    } catch (e) {
        console.error("Process Request Error:", e);
        showResult('🔴 حدث خطأ غير متوقع. حاول لاحقاً', 'error');
    }
}

// =================== مستمعي الأحداث (Event Listeners) (كما هي) =====================
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.menu-btn[data-service]').forEach(btn => {
        btn.addEventListener('click', () => showInput(btn.getAttribute('data-service')));
    });
    document.getElementById('submitBtn').addEventListener('click', processRequest);
    document.getElementById('backBtn').addEventListener('click', showMainMenu);
    document.getElementById('resultBackBtn').addEventListener('click', showMainMenu);
    
    document.getElementById('phoneInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') processRequest();
    });
    document.getElementById('passwordInput').addEventListener('keypress', e => {
        if (e.key === 'Enter') processRequest();
    });

    showMainMenu();
});
