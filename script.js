const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const SECRET_STRING = ",{.c][o^uecnlkijh*.iomv:QzCFRcd;drof/zx}w;ls.e85T^#ASwa?=(lk";
const CHANNEL_DATA = '{"channel":{"ChannelName":"MobinilAndMe","Password":"ig3yh*mk5l42@oj7QAR8yF"}}';
const APP_VERSION = "9.0.1";

const URLS = {
    TOKEN: PROXY_URL + "https://services.orange.eg/GetToken.svc/GenerateToken",
    FORGOT_PASS: PROXY_URL + "https://services.orange.eg/ProfileService.svc/ForgotPassword",
    SIGNIN: PROXY_URL + "https://services.orange.eg/SignIn.svc/SignInUser",
    GENERATE_BASIC_TOKEN: PROXY_URL + "https://services.orange.eg/APIs/Profile/api/BasicAuthentication/Generate",
    REDEEM_RAMADAN: PROXY_URL + "https://services.orange.eg/APIs/Promotions/api/CAF/Redeem",
    REDEEM_DANONE: PROXY_URL + "https://services.orange.eg/APIs/Promotions/api/Danone/RedeemVoucher",
    MERIDA: PROXY_URL + "https://api.meridagame.com/api/speedRedeemOffer",
    FAWAZEER_QUESTIONS: PROXY_URL + "https://services.orange.eg/APIs/Ramadan2024/api/RamadanOffers/Fawazeer/Questions",
    FAWAZEER_SUBMIT: PROXY_URL + "https://services.orange.eg/APIs/Ramadan2024/api/RamadanOffers/Fawazeer/Submit",
    BALANCE_CHECK: PROXY_URL + "https://www.orange.eg/apis/gsm/gsmonlinepayment/api/payment/rechargecheckeligibilityForOthers" 
};

let currentService = '';

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('danoneNotice').style.display = 'none';
}

// === ⬇️ تم التعديل هنا ⬇️ ===
function showInput(service) {
    currentService = service;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('inputSection').style.display = 'block';
    
    const requiresPassword = ['ramadan', 'fawazeer', 'danone'].includes(service);
    document.getElementById('passwordGroup').style.display = requiresPassword ? 'block' : 'none';
    
    // إظهار أو إخفاء حقل كود دانون
    const requiresDanoneCode = (service === 'danone');
    document.getElementById('danoneCodeGroup').style.display = requiresDanoneCode ? 'block' : 'none';

    // تعديل نص ملحوظة دانون
    document.getElementById('danoneNotice').style.display = (service === 'danone') ? 'block' : 'none';
    if(service === 'danone') {
        document.getElementById('danoneNotice').innerHTML = '<strong>ملحوظة هامة ⚠️</strong><br>سيتم محاولة تفعيل الكود الذي أدخلته.';
    }

    document.getElementById('inputLabel').textContent = {
        'merida': 'رقم الهاتف لتفعيل عرض 1000 ميجا',
        'ramadan': 'رقم الهاتف لتفعيل عرض 500 ميجا',
        'fawazeer': 'رقم الهاتف لتفعيل عرض 250 ميجا فوازير',
        'danone': 'رقم الهاتف لتفعيل عرض 250 ميجا دانون',
        'balance': 'رقم الهاتف لمعرفة الرصيد',
        'password': 'رقم الهاتف لاسترجاع كلمة المرور'
    }[service];
    
    document.getElementById('submitBtn').textContent = (service === 'balance' || service === 'password') ? 'طلب' : 'تفعيل';
    
    // تفريغ الحقول
    document.getElementById('phoneInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('danoneCodeInput').value = '';
}
// === ⬆️ انتهى التعديل ⬆️ ===

function showLoading(text = 'جاري المعالجة... ⏳') {
    document.getElementById('inputSection').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';
    document.getElementById('resultSection').style.display = 'none';
    document.getElementById('loadingText').innerHTML = text;
}

function showResult(message, type='success') {
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('resultSection').style.display = 'block';
    document.getElementById('resultMessage').innerHTML = `<div class="${type}">${message}</div>`;
}

async function makeRequest(url, options={}) {
    try {
        const defaultOptions = {
            method: 'POST',
            headers: { 'Content-Type':'application/json; charset=UTF-8','User-Agent':'Mozilla/5.0' },
            ...options
        };
        const response = await fetch(url, defaultOptions);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        try { return JSON.parse(text); } catch { return text; }
    } catch (error) { throw error; }
}

// =================== دوال الخدمات =====================

// (دوال Merida, ForgotPassword, Ramadan, Fawazeer ... كما هي)
// ...
// Merida - 1000 ميجا
async function processMerida(phone) {
    try {
        showLoading('جاري تفعيل عرض 1000 ميجا...');
        const payload = new URLSearchParams({ msisdn: phone, lang:"ar" });
        const response = await fetch(URLS.MERIDA,{
            method:'POST',
            headers:{
                'User-Agent':'Mozilla/5.0',
                'Origin':'https://speed.meridagame.com',
                'Referer':'https://speed.meridagame.com/',
                'Content-Type':'application/x-www-form-urlencoded'
            },
            body:payload
        });
        const data = await response.json();
        const msg = data?.data?.redeemOutputs?.RedeemErrorDoc?.errDesc || "Success";
        if(msg.toLowerCase()==="success") return {success:true,message:"✅ مبرووووك! تم تفعيل عرض 1000 ميجا بنجاح\n@alturky_2006"};
        else if(msg.includes("capping capacity")) return {success:false,message:"⚠️ حصلت على العرض مسبقاً 😥",type:'warning'};
        else return {success:false,message:`🔴 ${msg}`};
    } catch(e){ return {success:false,message:"🔴 خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً."}; }
}

// Forgot Password
async function processForgotPassword(phone){
    try{
        showLoading('جاري طلب كلمة المرور الجديدة...');
        const tokenData = await makeRequest(URLS.TOKEN,{body:CHANNEL_DATA});
        if(!tokenData?.GenerateTokenResult?.Token) return {success:false,message:"🔴 فشل في الاتصال بخادم اورانج"};
        const ctv = tokenData.GenerateTokenResult.Token;
        const htv = await generateSHA256(ctv+SECRET_STRING);
        const payload = {"channel":{"ChannelName":"MobinilAndMe","Password":"ig3yh*mk5l42@oj7QAR8yF"},"dialNumber":phone,"lang":"ar"};
        const response = await makeRequest(URLS.FORGOT_PASS,{headers:{'_ctv':ctv,'_htv':htv,'Content-Type':'application/json; charset=UTF-8','User-Agent':'okhttp/3.14.9'},body:JSON.stringify(payload)});
        const text = typeof response==='string'?response:JSON.stringify(response);
        if(text.includes("user data is null")||text.includes("UserDataIsNull")) return {success:false,message:"🔴 الرقم غير مسجل في خدمة اورانج"};
        else if(text.toLowerCase().includes("success")) return {success:true,message:"✅ تم إرسال كلمة المرور الجديدة في رسالة نصية إلى هاتفك"};
        else return {success:false,message:"⚠️ لا يمكن استرجاع كلمة المرور حالياً. حاول لاحقاً"};
    } catch(e){ return {success:false,message:"🔴 فشل في الاتصال بالخادم. تأكد من اتصالك بالإنترنت"}; }
}

// Ramadan 500 ميجا
async function processRamadan(phone,password){
    try{
        showLoading('جاري تسجيل الدخول...');
        const tokenData = await makeRequest(URLS.TOKEN,{body:CHANNEL_DATA});
        if(!tokenData?.GenerateTokenResult?.Token) return {success:false,message:"🔴 فشل في الحصول على التوكن"};
        const ctv = tokenData.GenerateTokenResult.Token;
        const htv = await generateSHA256(ctv+SECRET_STRING);
        const signInResult = await signInOrange(phone,password);
        if(!signInResult.success) return {success:false,message:"🔴 خطأ في تسجيل الدخول. تأكد من الرقم وكلمة المرور."};
        showLoading('جاري تفعيل عرض 500 ميجا...');
        const payload={"Language":"ar","OSVersion":"Android7.0","PromoCode":"رمضان كريم","dial":phone,"password":password,"Channelname":"MobinilAndMe","ChannelPassword":"ig3yh*mk5l42@oj7QAR8yF"};
        const result = await makeRequest(URLS.REDEEM_RAMADAN,{headers:{'_ctv':ctv,'_htv':htv,'UserId':signInResult.userId,'Content-Type':'application/json; charset=UTF-8','User-Agent':'okhttp/3.14.9'},body:JSON.stringify(payload)});
        const errorDesc = result?.ErrorDescription || '';
        const errorCode = result?.ErrorCode || -1;
        if(errorCode===0) return {success:true,message:"✅ مبرووووك! تم تفعيل عرض 500 ميجا اورانج بنجاح."};
        else if(errorDesc.includes("تم الاستخدام")) return {success:false,message:"⚠️ لقد استخدمت العرض مسبقاً",type:'warning'};
        else return {success:false,message:`🔴 ${errorDesc||'فشل التفعيل'}`};
    } catch(e){ return {success:false,message:"🔴 حدث خطأ في الاتصال بالخادم. حاول لاحقاً"};}
}

// Fawazeer 250 ميجا
async function processFawazeer(phone,password){
    try{
        showLoading('جاري تسجيل الدخول...');
        const signInResult = await signInOrangeFull(phone,password);
        if(!signInResult.success) return {success:false,message:"🔴 فشل تسجيل الدخول. تحقق من الرقم وكلمة المرور"};
        showLoading('جاري الحصول على أسئلة الفوازير...');
        const questionsPayload={"Dial":phone,"Language":"ar","Token":signInResult.basicToken};
        const questionsResponse = await makeRequest(URLS.FAWAZEER_QUESTIONS,{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},body:JSON.stringify(questionsPayload)});
        if(questionsResponse?.ErrorCode===1) return {success:false,message:"⚠️ لقد شاركت اليوم. حاول غداً",type:'warning'};
        const questions = questionsResponse?.Questions||[];
        if(questions.length===0) return {success:false,message:"⚠️ لا توجد أسئلة فوازير الآن"};
        const answers = questions.map(q=>({QuestionId:q.Answers.find(a=>a.IsCorrect).QuestionId,AnswerId:q.Answers.find(a=>a.IsCorrect).Id}));
        showLoading('جاري إرسال الإجابات...');
        const submitPayload={"Dial":phone,"Language":"ar","Token":signInResult.basicToken,"Answers":answers};
        const submitResult = await makeRequest(URLS.FAWAZEER_SUBMIT,{headers:{'User-Agent':'Mozilla/5.0','Content-Type':'application/json'},body:JSON.stringify(submitPayload)});
        if(submitResult?.ErrorDescription==="FawazeerSuccess") return {success:true,message:"✅ مبروووك! تم إضافة 250 ميجا بنجاح 🎉"};
        else return {success:false,message:`🔴 فشل الإرسال: ${submitResult?.ErrorDescription||'خطأ غير معروف'}`,type:'error'};
    } catch(e){ return {success:false,message:"🔴 خدمة الفوازير غير متاحة حالياً"};}
}

// ...

// ==================================================
// ======== 🚀 دالة دانون المعدلة (بإدخال يدوي) 🚀 ========
// ==================================================
// === ⬇️ تم التعديل هنا ⬇️ ===
async function processDanone(phone, password, voucherCode) { // استلام الكود كـ argument
    try {
        showLoading('جاري تسجيل الدخول...');
        const signInResult = await signInOrangeFull(phone, password);
        if (!signInResult.success) {
            return { success: false, message: "🔴 فشل تسجيل الدخول. تأكد من الرقم وكلمة المرور" };
        }

        showLoading('جاري تفعيل كود دانون...');

        const headers = {
            'User-Agent': "Mozilla/5.0 (Linux; Android 13; 21061119AG Build/TP1A.220624.014; wv) AppleWebKit/5.37.36 (KHTML, like Gecko) Version/4.0 Chrome/141.0.7390.122 Mobile Safari/5.37.36",
            'Accept': "application/json, text/plain, */*",
            'Content-Type': "application/json",
            'Origin': "https://services.orange.eg",
            'X-Requested-With': "com.orange.mobinilandmf",
            'Sec-Fetch-Site': "same-origin",
            'Sec-Fetch-Mode': "cors",
            'Sec-Fetch-Dest': "empty",
            'Referer': "https://services.orange.eg"
        };

        // إلغاء حلقة التخمين وإرسال طلب واحد بالكود المدخل
        const payload = {
            "Dial": phone,
            "Language": "ar",
            "Token": signInResult.basicToken,
            "VoucherCode": voucherCode // استخدام الكود المدخل من المستخدم
        };

        const result = await makeRequest(URLS.REDEEM_DANONE, { headers: headers, body: JSON.stringify(payload) });

        // 1. التحقق من النجاح
        if (result?.ErrorCode === 0) {
            return { success: true, message: `✅ مبروووك! تم شحن كارت دانون بنجاح 250MB!` };
        }

        // 2. التحقق من الأخطاء المعروفة
        const errorDesc = result?.ErrorDescription || JSON.stringify(result);
        if (errorDesc.includes("تم الاستخدام") || errorDesc.includes("الحد الأقصى") || errorDesc.includes("exceeded") || errorDesc.includes("لقد حصلت على الهدية")) {
            return { success: false, message: "⚠️ لقد أخذت الهدية اليوم أو وصلت للحد الأقصى.", type: 'warning' };
        }
        if (errorDesc.includes("غير صالح") || errorDesc.includes("Invalid")) {
             return { success: false, message: "🔴 الكود الذي أدخلته غير صالح أو منتهي.", type: 'error' };
        }

        // 3. فشل عام
        return { success: false, message: `❌ فشل شحن الكود: ${errorDesc}` };

    } catch (e) {
        return { success: false, message: "❌ حدث خطأ أثناء محاولة شحن كود دانون: " + e.message };
    }
}
// === ⬆️ انتهى التعديل ⬆️ ===
// ==================================================
// ==================================================


// دالة معرفة الرصيد
async function processBalance(phone) {
    showLoading('جاري الاستعلام عن الرصيد...');
    try {
        const payload = {"SelectedUserDial":null,"IsForAnotherRecipient":true,"RecipientDial":phone,"Dial":phone};
        const headers = {
            'User-Agent':'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/5.37.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/5.37.36',
            'Accept':'application/json, text/plain, */*',
            'Content-Type':'application/json',
            'lang':'ar',
            'Origin':'https://www.orange.eg',
            'Referer':'https://www.orange.eg/en/myaccount/pay-bill-or-recharge-for-others'
        };
        
        const result = await makeRequest(URLS.BALANCE_CHECK, { headers: headers, body: JSON.stringify(payload) });

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


// =================== دوال مساعدة =====================

// دالة التأخير (Sleep) - لم نعد بحاجة إليها لدانون لكن قد نحتاجها لشيء آخر
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function signInOrange(number,password){
    try{
        const payload={"appVersion":APP_VERSION,"channel":{"ChannelName":"MobinilAndMe","Password":"ig3yh*mk5l42@oj7QAR8yF"},"dialNumber":number,"isAndroid":true,"lang":"ar","password":password};
        const data = await makeRequest(URLS.SIGNIN,{body:JSON.stringify(payload)});
        const result = data?.SignInUserResult;
        if(result?.AccessToken && result?.ErrorCode===0) return {success:true,userId:result.UserData?.UserID,accessToken:result.AccessToken};
        else throw new Error(result?.ErrorDescription||'بيانات الدخول غير صحيحة');
    } catch(e){ return {success:false,error:e.message};}
}

async function signInOrangeFull(number,password){
    try{
        const basicSignIn = await signInOrange(number,password);
        if(!basicSignIn.success) return {success:false};
        const payload={"ChannelName":"MobinilAndMe","ChannelPassword":"ig3yh*mk5k5l42@oj7QAR8yF","Dial":number,"Language":"ar","Module":"0","Password":password};
        const response = await makeRequest(URLS.GENERATE_BASIC_TOKEN,{headers:{'User-Agent':'okhttp/4.10.0','AppVersion':APP_VERSION,'Token':basicSignIn.accessToken},body:JSON.stringify(payload)});
        const basicToken = response?.Token;
        if(basicToken) return {success:true,basicToken:basicToken,accessToken:basicSignIn.accessToken,userId:basicSignIn.userId};
        else return {success:false};
    } catch(e){ return {success:false};}
}

async function generateSHA256(text){
    try{
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256',data);
        return Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
    } catch(e){ return 'HASH_ERROR_'+Math.random().toString(36).substr(2,9);}
}

// =================== processRequest (تم التعديل) =====================
// === ⬇️ تم التعديل هنا ⬇️ ===
async function processRequest(){
    const phone=document.getElementById('phoneInput').value.trim();
    const password=document.getElementById('passwordInput').value.trim();
    const danoneCode = document.getElementById('danoneCodeInput').value.trim(); // قراءة الكود
    
    if(!phone) return showResult('⚠️ يرجى إدخال رقم الهاتف','error');
    if(!phone.match(/^01[0-9]{9}$/)) return showResult('⚠️ رقم الهاتف غير صالح','error');
    
    const requiresPassword = ['ramadan', 'fawazeer', 'danone'].includes(currentService);
    if(requiresPassword && !password) return showResult('⚠️ يرجى إدخال كلمة المرور','error');

    // التحقق من كود دانون
    if(currentService === 'danone' && !danoneCode) {
        return showResult('⚠️ يرجى إدخال كود دانون','error');
    }
    
    showLoading();
    try{
        let result;
        switch(currentService){
            case 'merida': result=await processMerida(phone); break;
            case 'ramadan': result=await processRamadan(phone,password); break;
            case 'fawazeer': result=await processFawazeer(phone,password); break;
            case 'danone': result=await processDanone(phone, password, danoneCode); break; // تمرير الكود
            case 'balance': result=await processBalance(phone); break; 
            case 'password': result=await processForgotPassword(phone); break;
            default: result={success:false,message:'⚠️ الخدمة غير معروفة'};
        }
        showResult(result.message,result.success?'success':result.type||'error');
    } catch(e){ showResult('🔴 حدث خطأ غير متوقع. حاول لاحقاً','error');}
}
// === ⬆️ انتهى التعديل ⬆️ ===

// =================== Event Listeners (تم التعديل) =====================
document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.menu-btn[data-service]').forEach(btn=>btn.addEventListener('click',()=>showInput(btn.getAttribute('data-service'))));
    document.getElementById('submitBtn').addEventListener('click',processRequest);
    document.getElementById('backBtn').addEventListener('click',showMainMenu);
    document.getElementById('resultBackBtn').addEventListener('click',showMainMenu);
    document.getElementById('phoneInput').addEventListener('keypress',e=>{if(e.key==='Enter') processRequest();});
    document.getElementById('passwordInput').addEventListener('keypress',e=>{if(e.key==='Enter') processRequest();});
    
    // === ⬇️ تم التعديل هنا ⬇️ ===
    // إضافة event listener لحقل كود دانون
    document.getElementById('danoneCodeInput').addEventListener('keypress',e=>{if(e.key==='Enter') processRequest();});
    // === ⬆️ انتهى التعديل ⬆️ ===
    
    showMainMenu();
});
