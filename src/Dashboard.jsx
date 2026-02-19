import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap } from "recharts";

// ═══════════════════════════════════════════════════════════════
// LUCKIN BRAND DESIGN SYSTEM (matching UC-FN-02 / UC-SC-02)
// ═══════════════════════════════════════════════════════════════
const L = {
  blue: "#1939E5", blueDark: "#0F2699", blueLight: "#EEF1FD", blueMid: "#4A63ED",
  white: "#FFFFFF", bg: "#F5F7FA", card: "#FFFFFF",
  text: "#1A1A2E", textSec: "#6B7280", textLight: "#9CA3AF",
  border: "#E5E7EB", borderLight: "#F3F4F6",
  red: "#E53E3E", green: "#16A34A", amber: "#D97706", gray: "#6B7280",
  purple: "#7C3AED", cyan: "#06B6D4", orange: "#EA580C", pink: "#DB2777", teal: "#0D9488",
};

const DEPT_COLORS = {
  IT: { main: "#3B82F6", bg: "#EFF6FF", label: "IT基础设施", icon: "🖥️" },
  MK: { main: "#7C3AED", bg: "#F5F3FF", label: "营销与客户", icon: "📣" },
  FN: { main: "#EA580C", bg: "#FFF7ED", label: "财务与合规", icon: "💰" },
  PR: { main: "#DB2777", bg: "#FDF2F8", label: "产品与菜单", icon: "☕" },
  OP: { main: "#16A34A", bg: "#F0FDF4", label: "门店运营", icon: "🏪" },
  SC: { main: "#0D9488", bg: "#F0FDFA", label: "供应链", icon: "📦" },
  EX: { main: "#D97706", bg: "#FFFBEB", label: "高管决策", icon: "👔" },
};

const PRIORITY_COLORS = { P0: L.red, P1: L.blue, P2: L.amber, P3: L.gray };
const DATA_COLORS = { GREEN: L.green, YELLOW: L.amber, RED: L.red };
const HORIZON_COLORS = { H1: "#3B82F6", H2: "#7C3AED", H3: "#EA580C", H4: "#D97706" };

// ═══════════════════════════════════════════════════════════════
// ALL 41 USE CASES — COMPLETE DATA
// ═══════════════════════════════════════════════════════════════
const USE_CASES = [
  { id:"IT-01", dept:"IT", name:"预测性基础设施监控", nameEn:"Predictive Infra Monitoring", score:4.05, priority:"P1", data:"GREEN", horizon:"H1", value:"$108-186K/年", method:"时序异常检测 (Prophet/PyOD)", problem:"3条告警规则损坏, 0个CloudWatch告警, Prometheus仅覆盖Redis", solution:"利用Grafana PromQL异常检测 + Amazon DevOps Guru，对233台EC2和143个数据库实例实现ML驱动的预测性监控", tools:"grafana/promql-anomaly-detection, PyOD, Merlion, awslabs CloudWatch MCP", deps:["Prometheus扩展覆盖","修复3条Grafana告警"], metrics:["MTTR < 15分钟","预测准确率 > 80%","P0事故 = 0"], demo:"https://iluckyhealth-guide.vercel.app/" },
  { id:"IT-02", dept:"IT", name:"数据库成本优化器", nameEn:"Database Cost Optimizer", score:3.70, priority:"P1", data:"GREEN", horizon:"H1", value:"$176K/年", method:"使用模式聚类 + 推荐引擎", problem:"78%EC2空闲率, 1.3% MySQL RI覆盖率, 6.6% ElastiCache RI覆盖率, $49.6K/月AWS支出", solution:"部署AWS Compute Optimizer + Cost Explorer MCP，识别右调大小机会，自动化RI/SP采购建议", tools:"awslabs Cost Explorer MCP, AWS CFM TIPs MCP, Infracost", deps:[], metrics:["EC2利用率 > 40%","RI覆盖率 > 50%","月度节省 > $10K"], demo:null },
  { id:"IT-03", dept:"IT", name:"自愈自动化", nameEn:"Self-Healing Automation", score:3.40, priority:"P2", data:"YELLOW", horizon:"H3", value:"MTTR降低60%", method:"事件驱动 + 决策树自动修复", problem:"运维依赖手动响应，夜间告警响应延迟", solution:"基于StackStorm/AWS Systems Manager，构建事件→诊断→修复自动化管道", tools:"StackStorm, AWS Systems Manager, Rundeck, Ansible+AWX", deps:["IT-01预测监控系统"], metrics:["自动修复率 > 70%","MTTR < 5分钟"], demo:null },
  { id:"IT-04", dept:"IT", name:"50店容量规划", nameEn:"50-Store Capacity Planning", score:2.85, priority:"P2", data:"YELLOW", horizon:"H4", value:"扩张保障", method:"回归 + 仿真模拟", problem:"当前基础设施为20,000店设计，但缺乏扩展成本预测", solution:"基于当前11店资源消耗模式，建模50店场景下的CPU/内存/存储/网络需求", tools:"Terraform + Atlantis, AWS EC2 Predictive Scaling, Infracost", deps:["IT-02成本数据","12+月运营数据"], metrics:["预测准确率 > 85%","扩展成本误差 < 15%"], demo:null },
  { id:"IT-05", dept:"IT", name:'NL数据库查询"问Lucky"', nameEn:"Ask Lucky NL Query", score:2.80, priority:"P2", data:"GREEN", horizon:"H3", value:"自助分析", method:"Dify+MCP自然语言到SQL", problem:"非技术人员无法直接查询数据库获取业务洞察", solution:"基于Vanna.ai + awslabs MySQL MCP Server，构建自然语言到SQL的查询接口，集成Dify平台", tools:"Vanna.ai, awslabs MySQL MCP, Dify database plugin, Wren AI", deps:["数据仓库(Redshift)"], metrics:["查询准确率 > 90%","用户满意度 > 4/5"], demo:null },
  { id:"IT-06", dept:"IT", name:"安全态势感知", nameEn:"Security Posture Intelligence", score:3.10, priority:"P2", data:"GREEN", horizon:"H3", value:"安全防护", method:"图异常检测 + SIEM", problem:"233台EC2无统一安全监控，0个活跃CloudWatch告警", solution:"部署Wazuh SIEM + Amazon GuardDuty，实现ML驱动的威胁检测和合规监控", tools:"Wazuh, Amazon GuardDuty, AWS Security Hub, Falco", deps:["CloudWatch日志集中化"], metrics:["威胁检测率 > 95%","误报率 < 5%"], demo:null },

  { id:"MK-01", dept:"MK", name:"客户360°全景", nameEn:"Customer 360 Unified Profile", score:4.15, priority:"P0", data:"GREEN", horizon:"H1", value:"个性化基础", method:"实体解析 + 特征存储", problem:"客户数据分散在8个数据库(salescrm, isalescdp, salesorder等)，无法形成统一视图", solution:"基于Splink实体解析 + Feast特征存储，在user_no上关联8个数据库，构建统一客户画像", tools:"Splink, Feast, dbt Core, SageMaker Feature Store", deps:["数据仓库(Redshift)"], metrics:["匹配率 > 95%","画像覆盖率 > 90%"], demo:null },
  { id:"MK-02", dept:"MK", name:"用户流失预测与召回", nameEn:"Churn Prediction & Win-Back", score:4.30, priority:"P0", data:"GREEN", horizon:"H1", value:"$200-430K/年", method:"XGBoost/LightGBM分类", problem:"76,238用户已流失(50.6%)，90+天未下单，仅12,285人近一周活跃", solution:"基于历史订单行为训练梯度提升模型，识别流失风险用户，触发定向召回策略", tools:"PyCaret, XGBoost, LightGBM, SHAP", deps:["MK-01客户360"], metrics:["AUC > 0.85","5%召回率 = $216K/年"], demo:null },
  { id:"MK-03", dept:"MK", name:"优惠券ROI优化器", nameEn:"Coupon ROI Optimizer", score:4.10, priority:"P1", data:"GREEN", horizon:"H2", value:"$50-100K/年", method:"因果推断 (Uplift建模)", problem:"37.3M优惠券过期未使用，营销预算巨大浪费", solution:"基于CausalML因果推断，量化每张优惠券的增量效果，优化分发策略", tools:"CausalML (Uber), DoWhy (Microsoft), scikit-uplift, EconML", deps:["MK-01客户360","A/B测试平台"], metrics:["优惠券ROI提升 > 30%","浪费减少 > 50%"], demo:null },
  { id:"MK-04", dept:"MK", name:"最佳行动引擎", nameEn:"Next-Best-Action Engine", score:3.65, priority:"P1", data:"YELLOW", horizon:"H2", value:"转化提升15-30%", method:"多臂老虎机/上下文Bandits", problem:"CDP有980K行为状态但未连接实时个性化决策", solution:"基于Vowpal Wabbit上下文Bandits，在每次用户交互时选择最优行动(优惠、推荐、推送)", tools:"Vowpal Wabbit, MABWiser (Fidelity)", deps:["MK-01客户360","MK-02流失预测","Feature Store"], metrics:["转化率提升 > 15%","CTR提升 > 25%"], demo:null },
  { id:"MK-05", dept:"MK", name:"客户生命周期价值", nameEn:"CLV Prediction", score:3.35, priority:"P2", data:"GREEN", horizon:"H3", value:"获客成本优化", method:"BG/NBD + Gamma模型", problem:"无法量化不同客户群体的长期价值，获客预算分配缺乏依据", solution:"基于PyMC-Marketing贝叶斯CLV模型，预测每位客户的未来购买概率和金额", tools:"PyMC-Marketing, lifetimes", deps:["MK-01客户360"], metrics:["预测误差 < 20%","高价值客户识别率 > 80%"], demo:null },
  { id:"MK-06", dept:"MK", name:"推送通知优化", nameEn:"Push Notification Optimizer", score:3.60, priority:"P1", data:"GREEN", horizon:"H2", value:"打开率+40-60%", method:"时间序列 + 个性化发送", problem:"2.3M条upush记录，但发送时间未优化", solution:"基于OneSignal ML发送时间优化 + 自定义SageMaker模型，个性化每位用户的推送时间", tools:"OneSignal, SageMaker", deps:["MK-01客户360"], metrics:["打开率提升 > 40%","退订率 < 2%"], demo:null },
  { id:"MK-07", dept:"MK", name:"A/B测试自动优化", nameEn:"A/B Test Auto-Optimization", score:3.80, priority:"P1", data:"GREEN", horizon:"H2", value:"实验效率", method:"贝叶斯优化", problem:"6.4M实验记录但手动选择赢家，实验周期长", solution:"基于GrowthBook贝叶斯+频率统计框架，自动判断实验显著性，缩短决策周期", tools:"GrowthBook, bayesian-testing", deps:["PostgreSQL数据源"], metrics:["实验周期缩短 > 50%","决策准确率 > 95%"], demo:null },
  { id:"MK-08", dept:"MK", name:"社交舆情监测", nameEn:"Social Listening", score:2.45, priority:"P3", data:"RED", horizon:"H4", value:"品牌保护", method:"NLP情感分析", problem:"缺乏社交媒体上的品牌提及和用户反馈监控", solution:"基于VADER+AWS Comprehend情感分析，监控社交媒体品牌提及和评价趋势", tools:"VADER (NLTK), AWS Comprehend, Mention", deps:["外部数据API"], metrics:["覆盖主流平台","响应时间 < 1小时"], demo:null },
  { id:"MK-09", dept:"MK", name:"裂变网络分析", nameEn:"Referral Network Analysis", score:2.55, priority:"P3", data:"YELLOW", horizon:"H4", value:"获客成本", method:"图分析 + 社区发现", problem:"有裂变数据但未分析网络效应和超级传播者", solution:"基于NetworkX + python-louvain构建用户裂变图谱，识别超级传播者和关键社区", tools:"NetworkX, python-louvain, Neo4j Community", deps:["裂变关系数据"], metrics:["识别TOP10%传播者","K-factor提升 > 20%"], demo:null },
  { id:"MK-10", dept:"MK", name:"渠道归因建模", nameEn:"Campaign Attribution", score:2.50, priority:"P3", data:"RED", horizon:"H4", value:"预算优化", method:"Shapley值归因 + Markov Chain", problem:"缺乏多渠道归因数据，预算分配依赖直觉", solution:"基于MTA库7种归因模型 + PyMC-Marketing媒体混合建模，量化各渠道贡献", tools:"MTA, PyMC-Marketing", deps:["多渠道追踪数据"], metrics:["归因覆盖率 > 80%","ROI提升 > 15%"], demo:null },

  { id:"FN-01", dept:"FN", name:"税务合规自动化", nameEn:"Tax Compliance Tracker", score:4.45, priority:"P0", data:"RED", horizon:"H1", value:"合规风险消除", method:"规则引擎 + 异常检测", problem:"fi_tax数据库完全为空，$2.19M收入横跨3个州，估计$150-195K回溯税务责任", solution:"紧急部署TaxJar Professional进行多州食品税务计算，同时构建临时税务追踪器", tools:"TaxJar Professional ($99-499/月)", deps:["支付数据(salespayment)"], metrics:["合规率 100%","自动计算准确率 > 99%"], demo:null },
  { id:"FN-02", dept:"FN", name:"营收对账自动化", nameEn:"Revenue Reconciliation", score:4.35, priority:"P0", data:"GREEN", horizon:"H1", value:"$30-60K/年", method:"确定性匹配 + ML模糊匹配", problem:"订单(466K)↔支付(518K)↔会计三方手动对账，存在金额单位不一致(分vs元)、ID类型不匹配(bigint vs varchar)", solution:"基于AWS Glue + Redshift Serverless的全自动3级对账管道：L1逐笔订单↔支付、L2订单↔收据+手续费、L3门店/日聚合匹配", tools:"AWS Glue, Redshift Serverless, recordlinkage, Great Expectations", deps:["修复order_id类型","过滤NZD测试数据"], metrics:["L1匹配率 > 95%","L2匹配率 > 99%","异常检测延迟 < 2h"], demo:"#uc-fn-02-demo" },
  { id:"FN-03", dept:"FN", name:"支付欺诈检测", nameEn:"Payment Fraud Detection", score:3.95, priority:"P1", data:"GREEN", horizon:"H2", value:"风险防控", method:"隔离森林 + 监督分类", problem:"缺乏实时支付欺诈检测机制", solution:"基于PyOD 50+异常检测算法 + River流式在线学习，在Kafka支付流上实时评分", tools:"PyOD, River", deps:["Kafka支付流接入"], metrics:["欺诈检测率 > 95%","误报率 < 1%"], demo:null },
  { id:"FN-04", dept:"FN", name:"支付渠道成本优化", nameEn:"Payment Channel Cost Opt", score:3.00, priority:"P2", data:"GREEN", horizon:"H4", value:"处理费节省", method:"成本分析 + 路由优化", problem:"502K手续费记录未分析，支付渠道选择未优化", solution:"基于pandas + scipy.optimize分析手续费模式，使用PuLP线性规划优化支付路由", tools:"pandas, scipy, PuLP", deps:["手续费数据分析"], metrics:["手续费降低 > 10%"], demo:null },
  { id:"FN-05", dept:"FN", name:"财务预测与场景", nameEn:"Financial Forecasting", score:2.65, priority:"P3", data:"RED", horizon:"H4", value:"投资决策", method:"时序预测 + 蒙特卡洛", problem:"缺乏数据驱动的财务预测和新店开业影响分析", solution:"基于StatsForecast多模型预测 + CausalImpact因果影响分析", tools:"StatsForecast, Prophet, CausalImpact", deps:["12+月完整财务数据"], metrics:["预测误差 < 10%"], demo:null },

  { id:"PR-01", dept:"PR", name:"菜单工程矩阵", nameEn:"Menu Engineering Matrix", score:3.90, priority:"P1", data:"GREEN", horizon:"H2", value:"$40-80K/年", method:"BCG四象限分析", problem:"1,448个产品，602K订单项目缺乏系统化分析", solution:"基于Plotly + Streamlit构建交互式BCG矩阵，分析产品销量×利润率，识别明星/金牛/问题/瘦狗产品", tools:"Plotly, Pandas, Streamlit", deps:["产品成本数据"], metrics:["底部20%SKU优化","新品成功率提升"], demo:null },
  { id:"PR-02", dept:"PR", name:"个性化推荐引擎", nameEn:"Personalized Recommendations", score:3.50, priority:"P2", data:"GREEN", horizon:"H3", value:"$100-200K/年", method:"混合推荐 (协同+内容)", problem:"App内缺乏个性化推荐，所有用户看到相同菜单", solution:"基于LightFM混合推荐模型(协同过滤+内容特征)，处理冷启动问题，实时推荐", tools:"LightFM, Amazon Personalize, Surprise", deps:["MK-01客户360","Feature Store"], metrics:["推荐CTR > 15%","客单价提升 > 10%"], demo:null },
  { id:"PR-03", dept:"PR", name:"价格弹性建模", nameEn:"Price Elasticity Modeling", score:3.25, priority:"P2", data:"GREEN", horizon:"H3", value:"定价优化", method:"因果推断 (工具变量法)", problem:"优惠券价格变化提供了天然实验，但未分析价格弹性", solution:"基于EconML的Double ML和Causal Forests，利用优惠券变化作为工具变量估计价格弹性", tools:"EconML, linearmodels", deps:["订单+优惠券关联数据"], metrics:["弹性估计置信区间 < 0.1"], demo:null },
  { id:"PR-04", dept:"PR", name:"新品上市预测", nameEn:"New Product Launch Predictor", score:3.05, priority:"P2", data:"YELLOW", horizon:"H3", value:"减少失败率", method:"类比匹配 + 早期信号", problem:"新品成功率未知，缺乏数据驱动的上市决策", solution:"基于sentence-transformers产品嵌入 + FAISS向量搜索，匹配历史类似产品表现进行预测", tools:"sentence-transformers, FAISS, XGBoost", deps:["历史产品表现数据"], metrics:["预测准确率 > 70%"], demo:null },
  { id:"PR-05", dept:"PR", name:"配方成本优化", nameEn:"Recipe Cost Optimization", score:2.95, priority:"P2", data:"GREEN", horizon:"H4", value:"$44-66K/年", method:"约束优化 (LP/MILP)", problem:"原料成本波动影响利润率", solution:"基于PuLP线性/混合整数规划，在保持口感评分约束下最小化原料成本", tools:"PuLP, Google OR-Tools", deps:["原料成本+配方数据"], metrics:["成本降低 > 5%","口感评分不变"], demo:null },

  { id:"OP-01", dept:"OP", name:"动态排班优化", nameEn:"Dynamic Staffing Optimizer", score:3.55, priority:"P2", data:"YELLOW", horizon:"H3", value:"劳动力节省", method:"整数规划 + 需求预测", problem:"47.5K打卡记录显示排班未与需求预测对齐", solution:"基于7shifts餐饮专用排班系统或Google OR-Tools CP-SAT自定义优化", tools:"7shifts ($34.99/店/月), Google OR-Tools", deps:["需求预测(SC-01)","打卡数据"], metrics:["人效提升 > 15%","劳动力成本降低 > 10%"], demo:null },
  { id:"OP-02", dept:"OP", name:"门店绩效异常检测", nameEn:"Store Performance Anomaly", score:4.00, priority:"P1", data:"GREEN", horizon:"H1", value:"运营优化", method:"统计过程控制 (SPC) + Z-Score", problem:"11家门店缺乏跨店多维度异常检测", solution:"基于PyOD+ADTK构建多变量异常检测引擎，实时监控每家门店的收入/订单/客单价异常", tools:"PyOD, ADTK, Luminaire (Zillow)", deps:["门店日报数据"], metrics:["异常检测准确率 > 85%","误报率 < 10%"], demo:"#uc-op-02-demo" },
  { id:"OP-03", dept:"OP", name:"制作时间预测器", nameEn:"Production Time Predictor", score:3.75, priority:"P1", data:"GREEN", horizon:"H2", value:"体验优化", method:"回归模型 → ONNX Runtime", problem:"App显示等待时间不准确，影响客户体验", solution:"基于LightGBM训练50.2万条生产记录→ONNX Runtime部署，实现亚毫秒推理", tools:"LightGBM, ONNX Runtime, SageMaker Endpoint", deps:["生产记录数据"], metrics:["预测误差 < 1分钟","p99延迟 < 50ms"], demo:null },
  { id:"OP-04", dept:"OP", name:"IoT预测性维护", nameEn:"IoT Predictive Maintenance", score:3.15, priority:"P2", data:"YELLOW", horizon:"H3", value:"设备可用率", method:"生存分析 (Weibull/Cox PH)", problem:"216台设备中57%离线，587.6K杯订单记录", solution:"基于lifelines生存分析+reliability最优替换时间计算，预测设备故障", tools:"lifelines, reliability", deps:["修复IoT设备连接"], metrics:["故障预测率 > 80%","计划外停机减少 > 50%"], demo:null },
  { id:"OP-05", dept:"OP", name:"排队等候管理", nameEn:"Queue/Wait Time Management", score:2.70, priority:"P3", data:"YELLOW", horizon:"H4", value:"体验优化", method:"排队论 (M/M/c) + 模拟", problem:"高峰期等待时间长，影响客户体验和订单量", solution:"基于Ciw排队仿真 + Faust Kafka流式处理，实时估计等待时间并显示在App中", tools:"Ciw, Faust, SimPy", deps:["实时订单流"], metrics:["等待时间预测误差 < 2分钟"], demo:null },
  { id:"OP-06", dept:"OP", name:"新店爬坡预测", nameEn:"New Store Ramp Predictor", score:2.75, priority:"P3", data:"GREEN", horizon:"H4", value:"扩张规划", method:"增长曲线拟合 (Bass)", problem:"仅11个数据点，新店业绩预测不确定性高", solution:"基于PyMC-Marketing贝叶斯Bass扩散模型，在小样本下量化不确定性", tools:"PyMC-Marketing, lmfit", deps:["12家门店开业数据"], metrics:["预测区间覆盖率 > 80%"], demo:"#uc-op-06-demo" },

  { id:"SC-01", dept:"SC", name:"需求预测监控", nameEn:"Demand Forecast Accuracy Monitor", score:4.20, priority:"P0", data:"GREEN", horizon:"H1", value:"库存优化", method:"预测vs实际反馈环 + 漂移检测", problem:"2.5M条预测无精度监控，无法知道预测是否准确", solution:"基于Evidently AI构建MAPE/MAE/漂移报告，导出到Prometheus→Grafana，实现闭环监控", tools:"Evidently AI, NannyML, Great Expectations, MLflow", deps:["ireplenishment预测数据"], metrics:["MAPE可见性 100%","漂移检测延迟 < 1天"], demo:"#uc-sc-01-demo" },
  { id:"SC-02", dept:"SC", name:"浪费预测与减少", nameEn:"Waste Prediction & Reduction", score:3.85, priority:"P1", data:"GREEN", horizon:"H2", value:"$20-50K/年", method:"时间序列 + Poisson回归", problem:"9.1M库存事件 + 136K过期记录，浪费模式未分析", solution:"基于statsmodels Poisson/负二项GLM + lifelines保质期生存分析", tools:"statsmodels, lifelines, Leanpath", deps:["库存变动数据","过期日志"], metrics:["浪费减少 > 30%","预测准确率 > 80%"], demo:"#uc-sc-02-demo" },
  { id:"SC-03", dept:"SC", name:"供应商绩效评分", nameEn:"Supplier Performance Scoring", score:3.20, priority:"P2", data:"GREEN", horizon:"H3", value:"供应风控", method:"多准则评分 (TOPSIS/VIKOR)", problem:"694份PO + 1,670份出货单缺乏系统评估", solution:"基于pymcdm TOPSIS/VIKOR/PROMETHEE多准则决策 + AHPy权重计算", tools:"pymcdm, AHPy", deps:["PO和出货数据"], metrics:["评分覆盖 > 90%供应商"], demo:null },
  { id:"SC-04", dept:"SC", name:"动态安全库存", nameEn:"Dynamic Par Level Setting", score:3.30, priority:"P2", data:"YELLOW", horizon:"H3", value:"库存优化", method:"报童模型 + ML需求分布", problem:"安全库存水平静态设置，无法响应需求变化", solution:"基于Stockpyl报童模型 + inventorize ABC分类，接入SageMaker预测的需求分布", tools:"Stockpyl, inventorize", deps:["SC-01需求预测","供应商交付数据"], metrics:["缺货率 < 2%","库存周转提升 > 20%"], demo:null },
  { id:"SC-05", dept:"SC", name:"易腐品保质期追踪", nameEn:"Perishable Shelf-Life Tracker", score:2.60, priority:"P3", data:"YELLOW", horizon:"H4", value:"减少浪费", method:"批次追踪 + FIFO/FEFO", problem:"缺乏系统化的保质期追踪和先过期先出管理", solution:"基于ERPNext/Odoo Community批次追踪 + FEFO自动排序", tools:"ERPNext, Odoo, InvenTree", deps:["批次管理流程"], metrics:["过期浪费减少 > 50%"], demo:null },

  { id:"EX-01", dept:"EX", name:"高管AI每日简报", nameEn:"Executive AI Daily Briefing", score:4.25, priority:"P0", data:"GREEN", horizon:"H1", value:"决策效率", method:"LLM摘要 (Dify 定时触发)", problem:"高管缺乏每日自动化的运营数据摘要", solution:"基于Dify定时触发 + database插件SQL查询 + LLM摘要生成，每日7AM通过Slack/邮件推送", tools:"Dify Scheduled Trigger, Slack MCP, n8n", deps:["Dify平台(已部署)"], metrics:["每日7AM准时推送","覆盖所有核心KPI"], demo:null },
  { id:"EX-02", dept:"EX", name:"选址模型增强", nameEn:"Site Selection Enhancement", score:2.90, priority:"P2", data:"GREEN", horizon:"H4", value:"扩张精准度", method:"集成学习 + 外部数据融合", problem:"现有模型R²=0.94但仅限曼哈顿数据，扩展至其他城市需要外部数据", solution:"融入US Census人口统计 + Google Places POI + BestTime.app人流量 + Yelp评价数据", tools:"US Census API, Google Places API, BestTime.app, Yelp Fusion API", deps:["现有选址模型"], metrics:["外部数据R²提升 > 2%"], demo:null },
  { id:"EX-03", dept:"EX", name:"统一KPI指挥中心", nameEn:"Unified KPI Command Center", score:3.45, priority:"P2", data:"YELLOW", horizon:"H3", value:"决策效率", method:"数据集市 + BI", problem:"143个孤立数据库无统一分析能力", solution:"部署Apache Superset(或Metabase)作为业务KPI平台，Grafana专注基础设施监控", tools:"Apache Superset, Metabase, Preset", deps:["数据仓库(Redshift)"], metrics:["自助查询用户 > 10人","报表覆盖 > 80% KPI"], demo:null },
  { id:"EX-04", dept:"EX", name:"竞争情报监控", nameEn:"Competitive Intelligence", score:2.40, priority:"P3", data:"RED", horizon:"H4", value:"战略规划", method:"爬虫 + NLP + 市场分析", problem:"缺乏系统化的竞争对手监控", solution:"基于Scrapy+Playwright爬取竞品菜单 + Outscraper评价数据 + Dify LLM分析", tools:"Scrapy, Playwright, Outscraper, RMS", deps:["外部数据源"], metrics:["覆盖TOP5竞品","更新频率 < 1周"], demo:null },
];

// ═══════════════════════════════════════════════════════════════
// LIVE DEMO LINKS (from past Vercel/Netlify deployments)
// ═══════════════════════════════════════════════════════════════
const DEMO_PROJECTS = [
  { category: "🏗️ 基础设施与监控", items: [
    { name: "数据库架构探索指南", desc: "iluckyhealth 14张表完整ER文档、指标字典、SQL查询模板、数据流映射", url: "https://iluckyhealth-guide.vercel.app/", tech: "Next.js + Tailwind", uc: "IT-01" },
    { name: "运维周报导航门户", desc: "整合4大周报子仪表板的交互式导航：指标趋势、告警、慢查询、根因分析", url: "https://1225weeklyreportv2.vercel.app/", tech: "React + Vite", uc: "IT-01" },
    { name: "运维指标周趋势分析", desc: "CPU、连接数、存储等核心指标5周趋势追踪，NAT网关流量与容量监控", url: "https://1225devopsindextrendanalysis.vercel.app/", tech: "React + Recharts", uc: "IT-01" },
    { name: "运维告警可视化分析", desc: "iZeus(宙斯)监控平台12/17-12/25告警数据，告警类型/等级/时间分布深度分析", url: "https://1225alertvisualizationdashboard.vercel.app/", tech: "React + Recharts", uc: "IT-01" },
    { name: "慢查询分析报告", desc: "MySQL慢查询双重排名法(执行时间×次数)，完整SQL语句及索引优化建议", url: "https://1223slowqueryanalyticdashboard.vercel.app/", tech: "React + Recharts", uc: "IT-01" },
    { name: "运维根因分析报告", desc: "关键告警根因分析(RCA)，风险评估矩阵，RDS实例规划与扩容建议", url: "https://1225devopsanalyticdashboard.vercel.app/", tech: "React + Recharts", uc: "IT-01" },
    { name: "IT服务门户 & AIGC视频平台", desc: "内部IT服务请求系统 + AI视频生成平台(Veo 3.1)，服务于市场部内容创作", url: "https://itserviceportalv2.vercel.app/", tech: "Next.js", uc: "IT-05/MK" },
  ]},
  { category: "📊 跨部门综合分析", items: [
    { name: "多项目分析总门户", desc: "营销效果分析、财务对账、产品客制化偏好、门店绩效等多维度分析集合", url: "https://luckincoffeeprojectdemo.netlify.app/", tech: "React + Recharts", uc: "多部门" },
    { name: "运维周报数据可视化", desc: "icapi/isapi域名QPS、响应时间、可用率、NAT网关等核心指标图表化报告", url: "https://luckincoffee12-25weekreport.netlify.app/", tech: "HTML + Chart.js", uc: "IT-01" },
  ]},
  { category: "🔬 AI用例项目演示", items: [
    { name: "UC-SC-01 需求预测精度监控", desc: "14天×10店×88 SKU预测vs实际对比、MAPE/MAE分析、门店+SKU维度钻取", url: "#deploy-uc-sc-01", tech: "Vite + Chart.js", uc: "SC-01" },
    { name: "UC-SC-02 废弃预测与减少", desc: "8源库ETL架构、加权集成预测模型、批次风险评分(0-100)、调拨优化", url: "#deploy-uc-sc-02", tech: "Vite + Recharts", uc: "SC-02" },
    { name: "UC-FN-02 营收对账自动化", desc: "4库对账架构(salesorder+payment+settlement+cyberdata)、3级匹配逻辑、异常检测", url: "#deploy-uc-fn-02", tech: "Vite + Recharts", uc: "FN-02" },
    { name: "UC-OP-06 新店开业流量分析", desc: "21st & 3rd开业日分析，全部门店开业曲线对比，4周成熟期模型", url: "#deploy-uc-op-06", tech: "Next.js + Recharts", uc: "OP-06" },
  ]},
  { category: "📈 市场与产品专项", items: [
    { name: "北美咖啡市场研究", desc: "$108B市场规模分析、竞争格局(Starbucks/Dunkin')、消费趋势、差异化策略", url: "#deploy-market", tech: "Vite + React", uc: "EX-04" },
    { name: "产品客制化偏好分析", desc: "大杯刚需(73%)、生椰基石(48%)、少冰痛点等，基于订单数据的菜单工程洞察", url: "#deploy-customize", tech: "Vite + React", uc: "PR-01" },
  ]},
];

// ═══════════════════════════════════════════════════════════════
// COMPUTED STATISTICS
// ═══════════════════════════════════════════════════════════════
const STATS = {
  total: USE_CASES.length,
  green: USE_CASES.filter(u => u.data === "GREEN").length,
  yellow: USE_CASES.filter(u => u.data === "YELLOW").length,
  red: USE_CASES.filter(u => u.data === "RED").length,
  p0: USE_CASES.filter(u => u.priority === "P0").length,
  p1: USE_CASES.filter(u => u.priority === "P1").length,
  p2: USE_CASES.filter(u => u.priority === "P2").length,
  p3: USE_CASES.filter(u => u.priority === "P3").length,
  depts: Object.keys(DEPT_COLORS).length,
};

const INFRA = [
  { label: "MySQL 实例", value: "62", icon: "🐬", color: L.blue },
  { label: "Redis/ElastiCache", value: "78", icon: "⚡", color: L.red },
  { label: "PostgreSQL", value: "3", icon: "🐘", color: L.purple },
  { label: "EC2 实例", value: "233", icon: "🖥️", color: L.orange },
  { label: "Kafka 主题", value: "308", icon: "📨", color: L.teal },
  { label: "月度 AWS", value: "$49.6K", icon: "💵", color: L.green },
];

const HORIZONS = [
  { id: "H1", name: "基础构建", months: "1-3月", focus: "数据平台 + 紧急修复", fte: "2.5", deliverables: "数据仓库, 5条CDC管道, 税务追踪, 高管AI简报, 成本优化", color: HORIZON_COLORS.H1 },
  { id: "H2", name: "运营智能", months: "4-6月", focus: "部门仪表板 + ML管道", fte: "4", deliverables: "12条CDC管道, Feature Store, 优惠券优化, 欺诈检测, A/B自动化", color: HORIZON_COLORS.H2 },
  { id: "H3", name: "AI增长", months: "7-12月", focus: "收入驱动型AI", fte: "6", deliverables: "流失预测, 推荐引擎, 价格弹性, CLV, 自愈自动化", color: HORIZON_COLORS.H3 },
  { id: "H4", name: "企业AI", months: "13-18月", focus: "自主运营 + 50店就绪", fte: "8", deliverables: "实时评分, 竞争情报, 容量规划, 裂变分析", color: HORIZON_COLORS.H4 },
];

const EXISTING_AI = [
  { name: "需求预测引擎", metric: "250万条预测", db: "ireplenishment", status: "运行中",
    have: "iReplenishment系统每日为10家门店×88 SKU生成预测，驱动自动补货，历史数据达250万条",
    gap: "无MAPE/MAE精度监控，无预测漂移检测，无预测vs实际反馈闭环 → UC-SC-01解决", icon: "📈" },
  { name: "A/B测试平台", metric: "640万条实验记录", db: "salesmarketing", status: "运行中",
    have: "完整的实验分配与记录系统，覆盖优惠券、推送、UI等场景，640万条历史实验数据",
    gap: "赢家判定依赖人工分析，无贝叶斯自动停止规则，实验周期偏长 → UC-MK-07解决", icon: "🧪" },
  { name: "客户数据平台(CDP)", metric: "98万条行为状态", db: "isalescdp", status: "运行中",
    have: "用户标签体系已建立，覆盖98万条用户行为状态记录，支持基础用户分群与圈选",
    gap: "未连接实时个性化决策引擎，标签更新延迟高，无在线Feature Store → UC-MK-04解决", icon: "👤" },
  { name: "CyberData ETL管道", metric: "1730万行数据", db: "icyberdata", status: "运行中",
    have: "自动化ETL管道运行稳定，每日从多源提取并加载1730万行数据至分析库",
    gap: "管道监控有限(无SLA告警)，数据质量检查不完整，缺少血缘追踪与异常告警", icon: "🔄" },
  { name: "Dify LLM平台", metric: "2个PostgreSQL实例", db: "dify_db", status: "运行中",
    have: "已部署Dify开源LLM平台，支持Prompt工程、Agent构建，可连接GPT/Claude等大模型",
    gap: "未集成实际运营数据库，无定时触发自动化流程，未用于业务洞察生成 → UC-EX-01/IT-05解决", icon: "🤖" },
  { name: "选址ML模型", metric: "R²=0.94精度", db: "评分API+重训脚本", status: "运行中",
    have: "基于人口/交通/竞品特征训练的集成学习模型，曼哈顿验证R²=0.94，有API服务和定期重训管道",
    gap: "仅覆盖曼哈顿区域数据，缺少外部人流量/Yelp评价数据，无法泛化至其他城市 → UC-EX-02解决", icon: "📍" },
];

// ═══════════════════════════════════════════════════════════════
// REUSABLE UI COMPONENTS
// ═══════════════════════════════════════════════════════════════
const KPI = ({ label, value, sub, accent }) => (
  <div style={{ background: L.white, borderRadius: 12, padding: "16px 20px", border: `1px solid ${L.border}`, borderTop: `3px solid ${accent || L.blue}`, minWidth: 0 }}>
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, color: L.textLight, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 24, fontWeight: 800, color: L.text, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: L.textSec, marginTop: 4 }}>{sub}</div>}
  </div>
);
const Card = ({ children, style }) => <div style={{ background: L.white, borderRadius: 12, padding: 20, border: `1px solid ${L.border}`, ...style }}>{children}</div>;
const SH = ({ children, sub }) => <div style={{ marginBottom: 16 }}><h2 style={{ fontSize: 19, fontWeight: 800, color: L.text, margin: 0 }}>{children}</h2>{sub && <p style={{ fontSize: 12, color: L.textSec, margin: "3px 0 0" }}>{sub}</p>}</div>;
const Badge = ({ text, color, outline }) => <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 10, fontSize: 10, fontWeight: 700, color: outline ? color : L.white, background: outline ? "transparent" : (color || L.gray), border: outline ? `1.5px solid ${color}` : "none" }}>{text}</span>;
const TabBtn = ({ active, children, onClick, accent }) => <button onClick={onClick} style={{ padding: "9px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 500, background: active ? (accent || L.blue) : "transparent", color: active ? L.white : L.textSec, transition: "all 0.2s", whiteSpace: "nowrap" }}>{children}</button>;

const DataBadge = ({ status }) => {
  const c = DATA_COLORS[status] || L.gray;
  const labels = { GREEN: "🟢 就绪", YELLOW: "🟡 需修复", RED: "🔴 缺失" };
  return <span style={{ fontSize: 10, fontWeight: 600, color: c }}>{labels[status]}</span>;
};

const PriorityBadge = ({ p }) => <Badge text={p} color={PRIORITY_COLORS[p]} />;
const HorizonBadge = ({ h }) => <Badge text={h} color={HORIZON_COLORS[h]} outline />;

// Use Case Expandable Card
const UCCard = ({ uc, isOpen, toggle }) => {
  const dept = DEPT_COLORS[uc.dept];
  return (
    <div style={{ background: L.white, border: `1px solid ${isOpen ? dept.main + "40" : L.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden", transition: "all 0.2s", boxShadow: isOpen ? `0 2px 12px ${dept.main}10` : "none" }}>
      <div onClick={toggle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", cursor: "pointer" }}>
        <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: dept.bg, color: dept.main, flexShrink: 0 }}>{uc.id}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: L.text, flex: 1 }}>{uc.name}</span>
        <span style={{ fontSize: 11, color: L.textLight }}>{uc.nameEn}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <DataBadge status={uc.data} />
          <PriorityBadge p={uc.priority} />
          <HorizonBadge h={uc.horizon} />
          <span style={{ fontSize: 16, fontWeight: 800, color: dept.main, width: 36, textAlign: "center" }}>{uc.score}</span>
        </div>
        <span style={{ fontSize: 12, color: L.textLight, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "none" }}>▾</span>
      </div>
      {isOpen && (
        <div style={{ borderTop: `1px solid ${L.borderLight}`, padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: L.textLight, marginBottom: 6, letterSpacing: 1 }}>📋 问题</div>
              <div style={{ fontSize: 12, color: L.textSec, lineHeight: 1.7 }}>{uc.problem}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: L.textLight, marginBottom: 6, letterSpacing: 1 }}>✅ 解决方案</div>
              <div style={{ fontSize: 12, color: L.textSec, lineHeight: 1.7 }}>{uc.solution}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: L.textLight, marginBottom: 6, letterSpacing: 1 }}>🛠️ 技术工具</div>
              <div style={{ fontSize: 11, color: L.text, lineHeight: 1.8 }}>{uc.tools}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: L.textLight, marginBottom: 6, letterSpacing: 1 }}>🔗 前置依赖</div>
              {uc.deps.length > 0 ? uc.deps.map((d, i) => <div key={i} style={{ fontSize: 11, color: L.textSec, padding: "2px 0" }}>• {d}</div>) : <div style={{ fontSize: 11, color: L.green }}>无前置依赖 ✓</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: L.textLight, marginBottom: 6, letterSpacing: 1 }}>🎯 成功指标</div>
              {uc.metrics.map((m, i) => <div key={i} style={{ fontSize: 11, color: L.textSec, padding: "2px 0" }}>• {m}</div>)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, borderTop: `1px solid ${L.borderLight}`, paddingTop: 12 }}>
            <span style={{ fontSize: 11, color: L.textLight }}>💡 AI方法: <strong style={{ color: L.text }}>{uc.method}</strong></span>
            <span style={{ fontSize: 11, color: L.textLight }}>💰 价值: <strong style={{ color: L.green }}>{uc.value}</strong></span>
            {uc.demo && uc.demo !== "#" && !uc.demo.startsWith("#") && (
              <a href={uc.demo} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: L.blue, textDecoration: "none", padding: "4px 12px", borderRadius: 6, background: L.blueLight }}>🔗 查看演示 →</a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CHART DATA
// ═══════════════════════════════════════════════════════════════
const deptDistData = Object.entries(DEPT_COLORS).map(([key, val]) => ({
  name: val.label, value: USE_CASES.filter(u => u.dept === key).length, color: val.main
}));
const readinessData = [
  { name: "就绪", value: STATS.green, color: L.green },
  { name: "需修复", value: STATS.yellow, color: L.amber },
  { name: "缺失", value: STATS.red, color: L.red },
];
const priorityData = [
  { name: "P0 紧急", value: STATS.p0, color: L.red },
  { name: "P1 重要", value: STATS.p1, color: L.blue },
  { name: "P2 计划", value: STATS.p2, color: L.amber },
  { name: "P3 远期", value: STATS.p3, color: L.gray },
];
const horizonData = HORIZONS.map(h => ({
  name: h.id, count: USE_CASES.filter(u => u.horizon === h.id).length, color: h.color
}));
const radarData = Object.entries(DEPT_COLORS).map(([key, val]) => {
  const ucs = USE_CASES.filter(u => u.dept === key);
  return { dept: val.label.replace(/与.*/, ""), avgScore: +(ucs.reduce((s,u) => s + u.score, 0) / ucs.length).toFixed(2), count: ucs.length, green: ucs.filter(u => u.data === "GREEN").length };
});

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [openUCs, setOpenUCs] = useState(new Set());
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [dataFilter, setDataFilter] = useState("ALL");
  const [prioFilter, setPrioFilter] = useState("ALL");
  const [searchQ, setSearchQ] = useState("");

  const toggleUC = (id) => setOpenUCs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expandAll = (ids) => setOpenUCs(new Set(ids));
  const collapseAll = () => setOpenUCs(new Set());

  const filteredUCs = useMemo(() => {
    return USE_CASES.filter(u => {
      if (deptFilter !== "ALL" && u.dept !== deptFilter) return false;
      if (dataFilter !== "ALL" && u.data !== dataFilter) return false;
      if (prioFilter !== "ALL" && u.priority !== prioFilter) return false;
      if (searchQ && !`${u.id}${u.name}${u.nameEn}${u.method}${u.tools}`.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.score - a.score);
  }, [deptFilter, dataFilter, prioFilter, searchQ]);

  const tabs = [
    { id: "overview", label: "📊 总览" },
    { id: "matrix", label: "📋 用例矩阵" },
    { id: "IT", label: "🖥️ IT基础设施" },
    { id: "MK", label: "📣 营销" },
    { id: "FN", label: "💰 财务" },
    { id: "PR", label: "☕ 产品" },
    { id: "OP", label: "🏪 运营" },
    { id: "SC", label: "📦 供应链" },
    { id: "EX", label: "👔 高管" },
    { id: "demos", label: "🔗 演示链接" },
    { id: "roadmap", label: "🗺️ 路线图" },
  ];

  const renderDeptTab = (deptKey) => {
    const dept = DEPT_COLORS[deptKey];
    const ucs = USE_CASES.filter(u => u.dept === deptKey).sort((a, b) => b.score - a.score);
    const greens = ucs.filter(u => u.data === "GREEN").length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: dept.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{dept.icon}</div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: L.text, margin: 0 }}>{dept.label}</h2>
            <p style={{ fontSize: 12, color: L.textSec, margin: "2px 0 0" }}>{ucs.length} 个用例 · {greens} 个数据就绪 · 平均评分 {(ucs.reduce((s,u) => s + u.score, 0) / ucs.length).toFixed(2)}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button onClick={() => expandAll(ucs.map(u => u.id))} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: `1px solid ${L.border}`, background: L.white, cursor: "pointer", color: L.textSec }}>展开全部</button>
            <button onClick={collapseAll} style={{ fontSize: 11, padding: "6px 12px", borderRadius: 6, border: `1px solid ${L.border}`, background: L.white, cursor: "pointer", color: L.textSec }}>收起全部</button>
          </div>
        </div>
        {ucs.map(uc => <UCCard key={uc.id} uc={uc} isOpen={openUCs.has(uc.id)} toggle={() => toggleUC(uc.id)} />)}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: L.bg }}>
      {/* ═══ HEADER ═══ */}
      <div style={{ background: `linear-gradient(135deg, ${L.blueDark}, ${L.blue})`, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ color: L.white, fontSize: 18, fontWeight: 900, letterSpacing: 1 }}>luckin coffee</span>
        </div>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12 }}>
          <span style={{ fontWeight: 700 }}>41个AI转型用例报告</span>
          <span style={{ margin: "0 8px", opacity: 0.4 }}>·</span>
          <span>Manhattan 10店 · 2026年2月</span>
        </div>
      </div>

      {/* ═══ TAB NAV ═══ */}
      <div style={{ background: L.white, borderBottom: `1px solid ${L.border}`, padding: "4px 16px", display: "flex", gap: 2, overflowX: "auto" }}>
        {tabs.map(t => (
          <TabBtn key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}
            accent={DEPT_COLORS[t.id]?.main}>{t.label}</TabBtn>
        ))}
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "20px 16px" }}>

{/* ═══════ OVERVIEW TAB ═══════ */}
{tab === "overview" && <div>
  <SH sub="Luckin Coffee USA — AI/ML用例全景与实施方案">41个AI用例 · 7大部门 · 18个月路线图</SH>

  {/* Hero KPIs */}
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
    <KPI label="AI用例总计" value={STATS.total} sub="7大部门覆盖" accent={L.blue} />
    <KPI label="数据就绪" value={`${STATS.green} (${Math.round(STATS.green/STATS.total*100)}%)`} sub="可立即启动" accent={L.green} />
    <KPI label="需数据修复" value={`${STATS.yellow} (${Math.round(STATS.yellow/STATS.total*100)}%)`} sub="有质量缺口" accent={L.amber} />
    <KPI label="需新采集" value={`${STATS.red} (${Math.round(STATS.red/STATS.total*100)}%)`} sub="需新数据源" accent={L.red} />
    <KPI label="数据库实例" value="143" sub="62 MySQL · 78 Redis · 3 PG" accent={L.purple} />
    <KPI label="预估年化价值" value="$1-2M" sub="保守至乐观区间" accent={L.orange} />
  </div>

  {/* Charts Row */}
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
    <Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: L.text, marginBottom: 12 }}>数据就绪度分布</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart><Pie data={readinessData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" labelLine={true}
          label={({ name, value, cx, cy, midAngle, outerRadius }) => {
            const RADIAN = Math.PI / 180;
            const radius = outerRadius + 25;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600, fill: "#4B5563" }}>{name} ({value})</text>;
          }}>
          {readinessData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie><Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} /></PieChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: L.text, marginBottom: 12 }}>部门用例分布</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={deptDistData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={L.borderLight} />
          <XAxis type="number" fontSize={10} tick={{ fill: L.textLight }} />
          <YAxis dataKey="name" type="category" fontSize={10} tick={{ fill: L.textLight }} width={70} />
          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
          <Bar dataKey="value" radius={[0,4,4,0]}>{deptDistData.map((d,i) => <Cell key={i} fill={d.color} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
    <Card>
      <div style={{ fontSize: 12, fontWeight: 700, color: L.text, marginBottom: 12 }}>优先级分布 (P0紧急 → P3远期)</div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart><Pie data={priorityData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" labelLine={true}
          label={({ name, value, cx, cy, midAngle, outerRadius }) => {
            const RADIAN = Math.PI / 180;
            const radius = outerRadius + 25;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return <text x={x} y={y} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" style={{ fontSize: 11, fontWeight: 600, fill: "#4B5563" }}>{name} ({value})</text>;
          }}>
          {priorityData.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie><Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} /></PieChart>
      </ResponsiveContainer>
    </Card>
  </div>

  {/* Existing AI Systems */}
  <Card style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 14 }}>✅ 已部署的6个AI/ML系统</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))", gap: 14 }}>
      {EXISTING_AI.map((ai, i) => (
        <div key={i} style={{ padding: 16, borderRadius: 10, background: L.bg, border: `1px solid ${L.borderLight}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 24 }}>{ai.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: L.text }}>{ai.name}</div>
              <div style={{ fontSize: 11, color: L.textSec }}>{ai.metric} · <code style={{ fontSize: 10, background: L.white, padding: "1px 5px", borderRadius: 3 }}>{ai.db}</code></div>
            </div>
            <Badge text={ai.status} color={L.green} style={{ marginLeft: "auto" }} />
          </div>
          <div style={{ fontSize: 11, color: L.green, lineHeight: 1.7, marginBottom: 8, padding: "8px 10px", background: "#F0FDF4", borderRadius: 6, borderLeft: `3px solid ${L.green}` }}>
            <span style={{ fontWeight: 700 }}>✅ 已有:</span> {ai.have}
          </div>
          <div style={{ fontSize: 11, color: L.amber, lineHeight: 1.7, padding: "8px 10px", background: "#FFFBEB", borderRadius: 6, borderLeft: `3px solid ${L.amber}` }}>
            <span style={{ fontWeight: 700 }}>⚠ 缺失:</span> {ai.gap}
          </div>
        </div>
      ))}
    </div>
  </Card>

  {/* Infrastructure */}
  <Card>
    <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 14 }}>🏗️ 基础设施规模 — "伪装成咖啡店的数据平台"</div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
      {INFRA.map((inf, i) => (
        <div key={i} style={{ textAlign: "center", padding: 12, borderRadius: 8, background: L.bg }}>
          <div style={{ fontSize: 20 }}>{inf.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: inf.color, marginTop: 4 }}>{inf.value}</div>
          <div style={{ fontSize: 10, color: L.textSec }}>{inf.label}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFFBEB", border: "1px dashed #D97706", borderRadius: 8, fontSize: 12, color: L.textSec }}>
      💡 <strong style={{ color: L.text }}>关键洞察：</strong>当前基础设施为中国20,000+店设计，远超11店需求。78%的EC2实例空闲，RI覆盖率仅1.3%。
      这意味着AI转型的基础设施成本接近零 — <strong style={{ color: L.green }}>真正的投资是人员</strong>。
    </div>
  </Card>
</div>}

{/* ═══════ MATRIX TAB ═══════ */}
{tab === "matrix" && <div>
  <SH sub="按评分排序 · 支持过滤和搜索">完整用例优先级矩阵 — {filteredUCs.length}/{STATS.total} 个用例</SH>

  {/* Filters */}
  <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
    <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 搜索用例ID、名称、工具..."
      style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${L.border}`, fontSize: 12, width: 240, outline: "none", fontFamily: "inherit" }} />
    <span style={{ fontSize: 10, fontWeight: 700, color: L.textLight, marginLeft: 8 }}>部门:</span>
    {["ALL", ...Object.keys(DEPT_COLORS)].map(d => (
      <button key={d} onClick={() => setDeptFilter(d)} style={{ padding: "5px 12px", borderRadius: 6, border: `1px solid ${deptFilter === d ? (DEPT_COLORS[d]?.main || L.blue) : L.border}`, background: deptFilter === d ? (DEPT_COLORS[d]?.bg || L.blueLight) : L.white, color: deptFilter === d ? (DEPT_COLORS[d]?.main || L.blue) : L.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
        {d === "ALL" ? "全部" : DEPT_COLORS[d].label}
      </button>
    ))}
    <span style={{ fontSize: 10, fontWeight: 700, color: L.textLight, marginLeft: 8 }}>数据:</span>
    {["ALL", "GREEN", "YELLOW", "RED"].map(d => (
      <button key={d} onClick={() => setDataFilter(d)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${dataFilter === d ? (DATA_COLORS[d] || L.blue) : L.border}`, background: dataFilter === d ? (DATA_COLORS[d] || L.blue) + "18" : L.white, color: dataFilter === d ? (DATA_COLORS[d] || L.blue) : L.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
        {d === "ALL" ? "全部" : d}
      </button>
    ))}
    <span style={{ fontSize: 10, fontWeight: 700, color: L.textLight, marginLeft: 8 }}>优先级:</span>
    {["ALL", "P0", "P1", "P2", "P3"].map(p => (
      <button key={p} onClick={() => setPrioFilter(p)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${prioFilter === p ? (PRIORITY_COLORS[p] || L.blue) : L.border}`, background: prioFilter === p ? (PRIORITY_COLORS[p] || L.blue) + "18" : L.white, color: prioFilter === p ? (PRIORITY_COLORS[p] || L.blue) : L.textSec, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>
        {p === "ALL" ? "全部" : p}
      </button>
    ))}
    <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
      <button onClick={() => expandAll(filteredUCs.map(u => u.id))} style={{ fontSize: 10, padding: "5px 10px", borderRadius: 6, border: `1px solid ${L.border}`, background: L.white, cursor: "pointer", color: L.textSec }}>展开全部</button>
      <button onClick={collapseAll} style={{ fontSize: 10, padding: "5px 10px", borderRadius: 6, border: `1px solid ${L.border}`, background: L.white, cursor: "pointer", color: L.textSec }}>收起全部</button>
    </div>
  </div>

  {/* Table Header */}
  <Card style={{ padding: 0, overflow: "hidden" }}>
    <div style={{ display: "grid", gridTemplateColumns: "30px 64px 1fr 120px 54px 54px 54px 54px", gap: 0, padding: "10px 14px", background: L.bg, fontSize: 10, fontWeight: 700, color: L.textLight, textTransform: "uppercase", letterSpacing: 0.8, borderBottom: `1px solid ${L.border}` }}>
      <span>#</span><span>ID</span><span>用例名称</span><span>AI方法</span><span>评分</span><span>优先级</span><span>数据</span><span>阶段</span>
    </div>
    {filteredUCs.map((uc, i) => {
      const dept = DEPT_COLORS[uc.dept];
      return (
        <div key={uc.id} onClick={() => toggleUC(uc.id)} style={{ display: "grid", gridTemplateColumns: "30px 64px 1fr 120px 54px 54px 54px 54px", gap: 0, padding: "9px 14px", borderBottom: `1px solid ${L.borderLight}`, cursor: "pointer", background: openUCs.has(uc.id) ? dept.bg : "transparent", fontSize: 12, alignItems: "center", transition: "background 0.15s" }}>
          <span style={{ color: L.textLight, fontSize: 11 }}>{i + 1}</span>
          <span style={{ fontWeight: 700, color: dept.main, fontSize: 11 }}>{uc.id}</span>
          <span style={{ fontWeight: 600, color: L.text }}>{uc.name} <span style={{ color: L.textLight, fontWeight: 400, fontSize: 10 }}>{uc.nameEn}</span></span>
          <span style={{ fontSize: 10, color: L.textSec }}>{uc.method.split("(")[0]}</span>
          <span style={{ fontWeight: 800, color: dept.main, textAlign: "center" }}>{uc.score}</span>
          <span style={{ textAlign: "center" }}><PriorityBadge p={uc.priority} /></span>
          <span style={{ textAlign: "center" }}><DataBadge status={uc.data} /></span>
          <span style={{ textAlign: "center" }}><HorizonBadge h={uc.horizon} /></span>
        </div>
      );
    })}
  </Card>

  {/* Expanded details below table */}
  {filteredUCs.filter(u => openUCs.has(u.id)).map(uc => (
    <div key={uc.id + "-detail"} style={{ marginTop: 10 }}>
      <UCCard uc={uc} isOpen={true} toggle={() => toggleUC(uc.id)} />
    </div>
  ))}
</div>}

{/* ═══════ DEPARTMENT TABS ═══════ */}
{["IT","MK","FN","PR","OP","SC","EX"].includes(tab) && renderDeptTab(tab)}

{/* ═══════ DEMOS TAB ═══════ */}
{tab === "demos" && <div>
  <SH sub="已部署的交互式仪表板和分析报告 — 点击链接查看在线演示">🔗 已完成的AI项目演示</SH>

  {DEMO_PROJECTS.map((cat, ci) => (
    <div key={ci} style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: L.text, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${L.borderLight}` }}>{cat.category}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 12 }}>
        {cat.items.map((item, ii) => (
          <a key={ii} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{ background: L.white, border: `1px solid ${L.border}`, borderRadius: 12, padding: 16, transition: "all 0.2s", cursor: "pointer" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = L.blue; e.currentTarget.style.boxShadow = `0 4px 16px ${L.blue}15`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = L.border; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: L.text }}>{item.name}</div>
                <Badge text={item.uc} color={L.blue} />
              </div>
              <div style={{ fontSize: 12, color: L.textSec, lineHeight: 1.6, marginBottom: 10 }}>{item.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: L.textLight }}>{item.tech}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: L.blue }}>
                  {item.url.startsWith("http") ? "🌐 在线访问 →" : "📦 待部署"}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  ))}

  <Card style={{ background: "#FFFBEB", borderColor: "#D97706" }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginBottom: 8 }}>💡 如何更新演示链接</div>
    <div style={{ fontSize: 12, color: L.textSec, lineHeight: 1.8 }}>
      标记为"待部署"的项目已有完整代码，只需推送到GitHub → Vercel自动部署。
      部署完成后，在 <code style={{ background: L.bg, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>Dashboard.jsx</code> 的 <code style={{ background: L.bg, padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>DEMO_PROJECTS</code> 数组中更新URL即可。
    </div>
  </Card>
</div>}

{/* ═══════ ROADMAP TAB ═══════ */}
{tab === "roadmap" && <div>
  <SH sub="4个阶段 · 18个月 · 从2.5 FTE渐进至8 FTE">实施路线图</SH>

  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
    {HORIZONS.map(h => (
      <Card key={h.id} style={{ borderTop: `4px solid ${h.color}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Badge text={h.id} color={h.color} />
          <span style={{ fontSize: 10, color: L.textLight }}>{h.months}</span>
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: L.text, marginBottom: 4 }}>{h.name}</div>
        <div style={{ fontSize: 11, color: L.textSec, marginBottom: 10 }}>{h.focus}</div>
        <div style={{ fontSize: 10, color: L.textLight, marginBottom: 6 }}>团队: {h.fte} FTE</div>
        <div style={{ fontSize: 11, color: L.text, lineHeight: 1.8, borderTop: `1px solid ${L.borderLight}`, paddingTop: 8 }}>
          {h.deliverables.split(", ").map((d, i) => <span key={i} style={{ display: "inline-block", padding: "2px 8px", margin: "2px", borderRadius: 4, background: L.bg, fontSize: 10 }}>{d}</span>)}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: h.color }}>
          {USE_CASES.filter(u => u.horizon === h.id).length} 个用例
        </div>
      </Card>
    ))}
  </div>

  {/* Horizon bar chart */}
  <Card style={{ marginBottom: 20 }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 14 }}>各阶段用例分布</div>
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={horizonData}><CartesianGrid strokeDasharray="3 3" stroke={L.borderLight} />
        <XAxis dataKey="name" fontSize={12} tick={{ fill: L.textSec }} />
        <YAxis fontSize={10} tick={{ fill: L.textLight }} />
        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
        <Bar dataKey="count" name="用例数" radius={[6,6,0,0]}>{horizonData.map((d,i) => <Cell key={i} fill={d.color} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  </Card>

  {/* Timeline */}
  <Card>
    <div style={{ fontSize: 14, fontWeight: 700, color: L.text, marginBottom: 14 }}>18个月里程碑时间线</div>
    {[
      { month: "第1月", items: "部署Redshift Serverless, 修复tax合规缺口, 启动5条CDC管道, EC2右调大小", color: HORIZON_COLORS.H1 },
      { month: "第2月", items: "营收对账管道上线, 高管AI简报, 需求预测监控, 门店异常检测", color: HORIZON_COLORS.H1 },
      { month: "第3月", items: "客户360画像完成, 流失预测v1训练, H1评审门: 6个管道运行", color: HORIZON_COLORS.H1 },
      { month: "第4-6月", items: "12条CDC管道, Feature Store, 优惠券ROI, 欺诈检测, 菜单工程, 浪费预测", color: HORIZON_COLORS.H2 },
      { month: "第7-9月", items: "流失召回系统, 推荐引擎, CLV模型, 价格弹性, 自愈自动化", color: HORIZON_COLORS.H3 },
      { month: "第10-12月", items: "实时评分部署, 安全态势, 排班优化, IoT维护, 16条CDC完成", color: HORIZON_COLORS.H3 },
      { month: "第13-18月", items: "50店容量模型, 竞争情报, 财务预测, 选址增强, 全平台运行", color: HORIZON_COLORS.H4 },
    ].map((m, i) => (
      <div key={i} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: i < 6 ? `1px solid ${L.borderLight}` : "none" }}>
        <div style={{ width: 80, flexShrink: 0, fontSize: 12, fontWeight: 700, color: m.color }}>{m.month}</div>
        <div style={{ fontSize: 12, color: L.textSec, lineHeight: 1.7 }}>{m.items}</div>
      </div>
    ))}
  </Card>
</div>}


      </div>
    </div>
  );
}
