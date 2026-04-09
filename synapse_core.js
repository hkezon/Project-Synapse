require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const path = require('path');

// ==========================================
// 1. 物理连接与 Vault 锚定
// ==========================================
const provider = new ethers.JsonRpcProvider('https://testrpc.xlayer.tech');
const wallet = new ethers.Wallet(process.env.AGENT_PRIVATE_KEY, provider);
const vaultContract = new ethers.Contract(
    process.env.VAULT_ADDRESS, 
    ["function executeIntent(address target, uint256 value, bytes calldata data) external returns (bytes memory)"], 
    wallet
);

// ==========================================
// 2. OKX 核心军火库
// ==========================================
function getOkxHeaders(method, requestPath, body = '') {
    const timestamp = new Date().toISOString();
    const payload = body === '' ? '' : JSON.stringify(body);
    const signStr = timestamp + method + requestPath + payload;
    const signature = crypto.createHmac('sha256', process.env.OK_SECRET_KEY)
                            .update(signStr)
                            .digest('base64');
    return {
        'OK-ACCESS-KEY': process.env.OK_API_KEY,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': process.env.OKX_PASSPHRASE,
        'Content-Type': 'application/json'
    };
}

// ==========================================
// 3. 认知大脑：直连 Google Gemini 原厂算力
// ==========================================
async function parseIntentWithLLM(userInput) {
    console.log(`[大脑] 正在思考自然语言指令: "${userInput}"`);
    const systemPrompt = `你是一个Web3交易意图解析引擎。请提取用户的交易意图，并严格以JSON格式返回，不要包含任何其他说明文字。
必须包含字段: action(如SWAP), chain(如XLayer), fromToken(如果是测试币/OKB，地址固定为 0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee), toToken(随便给个目标资产地址，比如 0x382bb369d343125bfb2117af9c149795c6c65c50), amount(将人类数字转为精度为18的最小单位，比如 1 = 1000000000000000000，0.0001 = 100000000000000)。`;

    const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.LLM_API_KEY}`,
        {
            contents: [{ role: "user", parts: [{ text: systemPrompt + "\n\n用户指令: " + userInput }] }],
            generationConfig: { temperature: 0.1 }
        },
        { headers: { 'Content-Type': 'application/json' } }
    );

    let aiReply = response.data.candidates[0].content.parts[0].text;
    aiReply = aiReply.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log(`[大脑] Gemini 解析结果:`, aiReply);
    return JSON.parse(aiReply);
}

// ==========================================
// 4. 神经桥接：OKX V6 路由
// ==========================================
async function fetchRealOnchainOSCalldata(intentJson) {
    console.log(`[神经] 请求 OKX V6 路由...`);
    const chainId = '195';
    const requestPath = `/api/v6/dex/aggregator/swap?chainId=${chainId}&amount=${intentJson.amount}&fromTokenAddress=${intentJson.fromToken}&toTokenAddress=${intentJson.toToken}&slippage=0.01&userWalletAddress=${process.env.VAULT_ADDRESS}`;

    try {
        const response = await axios.get(`https://www.okx.com${requestPath}`, { headers: getOkxHeaders('GET', requestPath) });
        if (response.data.code !== "0" || !response.data.data || response.data.data.length === 0) {
            console.log(`[战术降级] 路由异常，触发自转账保活。`);
            return { target: process.env.VAULT_ADDRESS, value: 0, data: "0x" };
        }
        return { target: response.data.data[0].tx.to, value: response.data.data[0].tx.value, data: response.data.data[0].tx.data };
    } catch (error) {
        console.log(`[战术降级] 网络异常，触发自转账保活。`);
        return { target: process.env.VAULT_ADDRESS, value: 0, data: "0x" };
    }
}

// ==========================================
// 5. 组装机甲外壳：启动 Web API 服务器
// ==========================================
const app = express();
app.use(cors());
app.use(express.json());

// 极其关键的一步：让 Node.js 直接把前端网页发给用户
app.use(express.static(__dirname));

// 处理前端的自然语言指令
app.post('/api/chat', async (req, res) => {
    try {
        const userIntent = req.body.intent; 
        if (!userIntent) return res.status(400).json({ error: "指令不能为空" });

        console.log(`\n========== 接收到前端指令 ==========`);
        
        const intentJson = await parseIntentWithLLM(userIntent);
        const { target, value, data } = await fetchRealOnchainOSCalldata(intentJson);
        
        console.log(`[神经] 准备调用 Vault...`);
        const tx = await vaultContract.executeIntent(target, value, data);
        
        console.log(`[执行] 交易已广播，等待上链...`);
        const receipt = await tx.wait();
        console.log(`[战果] 突触打击完成! TxHash: ${tx.hash}`);
        
        res.json({
            success: true,
            parsedIntent: intentJson,
            txHash: tx.hash,
            message: "执行成功"
        });
    } catch (error) {
        console.error(`[系统异常]`, error.message);
        res.status(500).json({ success: false, error: "执行失败，请查看后端日志" });
    }
});

// 云端动态端口注入
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n[系统启动] Project Synapse 核心大脑已上线。`);
    console.log(`[雷达] 正在监听公网端口: ${PORT}`);
    console.log(`[雷达] 正在持续扫描指令传入...`);
});
