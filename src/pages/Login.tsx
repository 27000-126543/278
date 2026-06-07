import { useState, useEffect } from 'react';
import { Camera, User, Shield, ChevronRight, Check, Loader2, ScanFace, AlertTriangle, X, KeyRound } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

interface FaceFeature {
  role: UserRole;
  featureCode: string;
  registered: boolean;
}

const FEATURE_STORAGE_KEY = 'oilfield_face_features_v2';

const generateFeatureCode = () => {
  const chars = '0123456789ABCDEF';
  let code = '';
  for (let i = 0; i < 32; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if ((i + 1) % 8 === 0 && i < 31) code += '-';
  }
  return code;
};

const loadStoredFeatures = (): FaceFeature[] => {
  try {
    const stored = localStorage.getItem(FEATURE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('加载人脸特征失败', e);
  }
  return [
    { role: 'worker', featureCode: '', registered: false },
    { role: 'leader', featureCode: '', registered: false },
    { role: 'manager', featureCode: '', registered: false },
  ];
};

const saveStoredFeatures = (features: FaceFeature[]) => {
  try {
    localStorage.setItem(FEATURE_STORAGE_KEY, JSON.stringify(features));
  } catch (e) {
    console.error('保存人脸特征失败', e);
  }
};

const calculateSimilarity = (code1: string, code2: string): number => {
  if (!code1 || !code2) return 0;
  const clean1 = code1.replace(/-/g, '');
  const clean2 = code2.replace(/-/g, '');
  if (clean1.length !== clean2.length) return 0;
  
  let matches = 0;
  for (let i = 0; i < clean1.length; i++) {
    if (clean1[i] === clean2[i]) matches++;
  }
  return matches / clean1.length;
};

const SIMILARITY_THRESHOLD = 0.8;

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [faceFeatures, setFaceFeatures] = useState<FaceFeature[]>(loadStoredFeatures());
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [failedSimilarity, setFailedSimilarity] = useState<number>(0);
  const login = useUserStore((state) => state.login);

  useEffect(() => {
    saveStoredFeatures(faceFeatures);
  }, [faceFeatures]);

  const roles = [
    { id: 'worker' as UserRole, name: '采油工', desc: '查看油井数据，接收工单', icon: User },
    { id: 'leader' as UserRole, name: '队长', desc: '管辖区域数据，工单分派', icon: Shield },
    { id: 'manager' as UserRole, name: '厂长', desc: '全油田总览，报表审批', icon: Shield },
  ];

  const getFaceInfo = (role: UserRole) => faceFeatures.find(f => f.role === role);

  const handleFaceScan = () => {
    if (!selectedRole) return;
    
    setIsScanning(true);
    setScanStep(1);
    setScannedCode(null);
    setLoginError(null);
    setSimilarity(null);
    setShowFailedModal(false);

    const faceInfo = getFaceInfo(selectedRole);
    const needsRegister = !faceInfo?.registered || isRegisterMode;

    setTimeout(() => setScanStep(2), 800);

    setTimeout(() => {
      setScanStep(3);
      
      if (needsRegister) {
        const newCode = generateFeatureCode();
        setScannedCode(newCode);
        setFaceFeatures(prev => prev.map(f => 
          f.role === selectedRole ? { ...f, featureCode: newCode, registered: true } : f
        ));
        
        setTimeout(() => {
          setScanStep(4);
          setTimeout(() => {
            setIsScanning(false);
            setScanStep(0);
            setIsRegisterMode(false);
            login(selectedRole);
            onLogin(selectedRole);
          }, 1000);
        }, 800);
      } else {
        const isMatch = Math.random() > 0.35;
        let scanned: string;
        let sim: number;
        
        if (isMatch) {
          scanned = faceInfo!.featureCode;
          sim = 0.85 + Math.random() * 0.15;
        } else {
          scanned = generateFeatureCode();
          sim = calculateSimilarity(faceInfo!.featureCode, scanned);
        }
        
        setScannedCode(scanned);
        setSimilarity(sim);
        
        setTimeout(() => {
          if (sim >= SIMILARITY_THRESHOLD) {
            setScanStep(4);
            setTimeout(() => {
              login(selectedRole);
              onLogin(selectedRole);
              setIsScanning(false);
              setScanStep(0);
            }, 800);
          } else {
            setScanStep(0);
            setIsScanning(false);
            setFailedSimilarity(sim);
            setShowFailedModal(true);
          }
        }, 1000);
      }
    }, 2000);
  };

  const getScanStatusText = () => {
    const faceInfo = selectedRole ? getFaceInfo(selectedRole) : null;
    const needsRegister = !faceInfo?.registered || isRegisterMode;
    
    switch (scanStep) {
      case 1: return '正在采集人脸图像...';
      case 2: return '正在提取特征码...';
      case 3: return needsRegister ? '正在录入特征库...' : '正在比对特征码...';
      case 4: return needsRegister ? '录入成功！' : '验证通过！';
      default: return '';
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    setScannedCode(null);
    setSimilarity(null);
    setShowFailedModal(false);
    const info = getFaceInfo(role);
    setIsRegisterMode(!info?.registered);
  };

  const handleRetry = () => {
    setShowFailedModal(false);
    setSimilarity(null);
  };

  const handleReRegister = () => {
    setShowFailedModal(false);
    setIsRegisterMode(true);
    setSimilarity(null);
  };

  return (
    <div className="w-full h-full grid-bg flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-tech-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tech-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-5 gap-8 items-center px-8">
        <div className="col-span-3 space-y-6">
          <div>
            <h1 className="font-display text-5xl text-tech-blue glow-text tracking-wider">
              智慧油田
            </h1>
            <p className="font-display text-2xl text-tech-cyan mt-2">
              采油与管网调度可视化平台
            </p>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            基于3D可视化技术的智能油田生产监控系统，
            集成智能预警、故障诊断、产量预测、环保监测等功能，
            为油田生产管理提供全方位智能化决策支持。
          </p>
          <div className="grid grid-cols-4 gap-4 pt-4">
            {[
              { label: '油井监控', value: '8口' },
              { label: '实时更新', value: '3秒' },
              { label: '智能预警', value: '7×24h' },
              { label: '人脸识别', value: '已启用' },
            ].map((item, i) => (
              <div key={i} className="tech-border p-3 text-center">
                <div className="font-display text-2xl text-tech-blue">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 tech-border p-8 relative">
          <h2 className="font-display text-xl text-white mb-6 flex items-center gap-2">
            <ScanFace className="text-tech-blue" />
            人脸识别登录
          </h2>

          <div className="aspect-square bg-dark-900 rounded-lg border-2 border-tech-blue/30 flex items-center justify-center mb-4 relative overflow-hidden">
            {isScanning ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-36 h-36 rounded-full border-4 border-tech-blue/50 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-tech-blue animate-ping opacity-30" />
                  <div className="absolute inset-4 rounded-full border-2 border-tech-cyan/50 animate-pulse" />
                  <div className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center">
                    {scanStep === 4 ? (
                      <Check size={32} className="text-status-normal" />
                    ) : (
                      <ScanFace size={32} className="text-tech-blue animate-pulse" />
                    )}
                  </div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke="rgba(0, 212, 255, 0.3)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="45%"
                      fill="none"
                      stroke={scanStep === 4 ? '#34C759' : '#00D4FF'}
                      strokeWidth="3"
                      strokeDasharray={`${scanStep * 25 * 2.83} 283`}
                      className="transition-all duration-500"
                    />
                  </svg>
                </div>
                <p className="text-tech-blue mt-4 text-sm animate-pulse">{getScanStatusText()}</p>
                {similarity !== null && scanStep >= 3 && (
                  <p className={`mt-2 text-sm ${similarity >= SIMILARITY_THRESHOLD ? 'text-status-normal' : 'text-status-alarm'} font-medium`}>
                    特征相似度: {(similarity * 100).toFixed(1)}%
                  </p>
                )}
                {scannedCode && showCode && (
                  <div className="mt-2 px-3 py-1.5 bg-tech-blue/10 rounded border border-tech-blue/30">
                    <code className="text-tech-cyan text-xs font-mono">{scannedCode}</code>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-tech-blue/10 flex items-center justify-center mx-auto mb-3">
                  <ScanFace size={36} className="text-tech-blue/50" />
                </div>
                <p className="text-gray-500 text-sm">请选择角色后点击登录</p>
                {selectedRole && getFaceInfo(selectedRole)?.registered && (
                  <p className="text-status-normal text-xs mt-2">✓ 人脸特征已录入</p>
                )}
                {selectedRole && !getFaceInfo(selectedRole)?.registered && (
                  <p className="text-status-warning text-xs mt-2">⚠️ 首次使用，将自动录入</p>
                )}
              </div>
            )}
            {isScanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-tech-blue to-transparent animate-bounce" />
            )}
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-status-alarm/10 border border-status-alarm/30 rounded-lg flex items-start gap-2">
              <AlertTriangle size={18} className="text-status-alarm shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-status-alarm text-sm">{loginError}</p>
              </div>
              <button onClick={() => setLoginError(null)} className="text-gray-500 hover:text-white">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-xs text-gray-500 hover:text-tech-blue transition-colors flex items-center gap-1"
            >
              <KeyRound size={12} />
              {showCode ? '隐藏特征码' : '显示特征码'}
            </button>
            {isRegisterMode && selectedRole && (
              <span className="text-xs text-status-warning bg-status-warning/10 px-2 py-1 rounded flex items-center gap-1">
                <Check size={10} />
                录入模式
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-gray-400 text-sm">选择登录角色：</p>
            {roles.map((role) => {
              const faceInfo = getFaceInfo(role.id);
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  disabled={isScanning}
                  className={`w-full p-4 rounded-lg border transition-all flex items-center gap-4 ${
                    selectedRole === role.id
                      ? 'border-tech-blue bg-tech-blue/10 glow-box'
                      : 'border-gray-700 hover:border-gray-600 bg-dark-700/50'
                  } ${isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedRole === role.id ? 'bg-tech-blue/20' : 'bg-gray-700/50'
                  }`}>
                    <role.icon size={20} className={selectedRole === role.id ? 'text-tech-blue' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${selectedRole === role.id ? 'text-tech-blue' : 'text-white'}`}>
                      {role.name}
                    </div>
                    <div className="text-xs text-gray-500">{role.desc}</div>
                  </div>
                  {faceInfo?.registered && (
                    <div className="w-5 h-5 rounded-full bg-status-normal/20 flex items-center justify-center">
                      <Check size={12} className="text-status-normal" />
                    </div>
                  )}
                  {selectedRole === role.id && (
                    <ChevronRight size={20} className="text-tech-blue" />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleFaceScan}
            disabled={!selectedRole || isScanning}
            className={`w-full py-3 rounded-lg font-medium text-lg transition-all flex items-center justify-center gap-2 ${
              selectedRole && !isScanning
                ? 'bg-gradient-to-r from-tech-blue to-tech-cyan text-dark-900 hover:shadow-lg hover:shadow-tech-blue/30 active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isRegisterMode ? '特征录入中...' : '识别验证中...'}
              </>
            ) : (
              <>
                <Camera size={20} />
                {isRegisterMode ? '录入并登录' : '人脸识别登录'}
              </>
            )}
          </button>

          <div className="mt-4 p-3 bg-dark-700/30 rounded-lg">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <KeyRound size={12} />
              验证规则: 特征码相似度 ≥ {(SIMILARITY_THRESHOLD * 100).toFixed(0)}% 方可登录
            </p>
          </div>

          <p className="text-center text-gray-600 text-xs mt-4">
            本系统仅供演示使用，模拟人脸识别验证流程
          </p>

          {showFailedModal && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-20">
              <div className="tech-border border-status-alarm/50 bg-dark-800 p-6 max-w-sm mx-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-status-alarm/20 rounded-full">
                    <AlertTriangle size={24} className="text-status-alarm" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-status-alarm">验证失败</h3>
                    <p className="text-gray-400 text-sm">人脸特征不匹配</p>
                  </div>
                </div>
                
                <div className="bg-dark-900/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm">当前相似度</span>
                    <span className="text-status-alarm font-display text-2xl">
                      {(failedSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-status-alarm transition-all"
                      style={{ width: `${failedSimilarity * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span className="text-tech-blue">阈值 {(SIMILARITY_THRESHOLD * 100).toFixed(0)}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-4">
                  请确保正对摄像头，光线充足，或重新录入人脸特征。
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2 bg-tech-blue/20 text-tech-blue rounded-lg font-medium hover:bg-tech-blue/30 transition-colors"
                  >
                    重新识别
                  </button>
                  <button
                    onClick={handleReRegister}
                    className="flex-1 py-2 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    重新录入
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
