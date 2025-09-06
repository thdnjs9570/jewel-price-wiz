import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Calculator, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GoldPrice {
  vatPrice: number;
  cashPrice: number;
  lastUpdated: string;
}

interface MarginSettings {
  k14: number;
  k18: number;
  k24: number;
}

interface CalculationInputs {
  purity: '14k' | '18k' | '24k';
  weight: string;
  laborCost: string;
  priceType: 'vat' | 'cash';
}

interface CalculationResult {
  baseCost: number;
  regularPrice: number;
  discountPrice: number;
  regularProfit: number;
  discountProfit: number;
  regularProfitRate: number;
  discountProfitRate: number;
}

const JewelryCalculator = () => {
  const { toast } = useToast();
  const [goldPrice, setGoldPrice] = useState<GoldPrice>(() => {
    const saved = localStorage.getItem('goldPrice');
    return saved ? JSON.parse(saved) : {
      vatPrice: 0,
      cashPrice: 0,
      lastUpdated: ''
    };
  });

  const [marginSettings, setMarginSettings] = useState<MarginSettings>(() => {
    const saved = localStorage.getItem('marginSettings');
    return saved ? JSON.parse(saved) : {
      k14: 20,
      k18: 23,
      k24: 10
    };
  });

  const [inputs, setInputs] = useState<CalculationInputs>({
    purity: '18k',
    weight: '',
    laborCost: '',
    priceType: 'vat'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [tempGoldPrice, setTempGoldPrice] = useState(goldPrice);
  const [tempMarginSettings, setTempMarginSettings] = useState(marginSettings);

  // 계산 로직
  const calculatePrice = (): CalculationResult | null => {
    console.log('=== 계산 시작 ===');
    console.log('입력값:', JSON.stringify(inputs, null, 2));
    console.log('금시세:', JSON.stringify(goldPrice, null, 2));
    console.log('마진 설정:', JSON.stringify(marginSettings, null, 2));

    const weight = parseFloat(inputs.weight || '0');
    const laborCost = parseFloat(inputs.laborCost || '0');
    const currentGoldPrice = inputs.priceType === 'vat' ? goldPrice.vatPrice : goldPrice.cashPrice;

    console.log('파싱된 값들:', {
      weight: weight,
      laborCost: laborCost, 
      currentGoldPrice: currentGoldPrice,
      weightString: inputs.weight,
      laborString: inputs.laborCost
    });

    // 입력값 유효성 검사
    if (!inputs.weight || inputs.weight.trim() === '' || isNaN(weight) || weight <= 0) {
      console.log('중량 검사 실패:', {
        weightInput: inputs.weight,
        weightParsed: weight,
        isEmpty: !inputs.weight,
        isEmptyTrim: inputs.weight ? inputs.weight.trim() === '' : 'no input',
        isNaN: isNaN(weight),
        isLessOrEqual: weight <= 0
      });
      return null;
    }
    
    if (!currentGoldPrice || currentGoldPrice <= 0) {
      console.log('금시세 검사 실패:', currentGoldPrice);
      return null;
    }

    if (isNaN(laborCost) || laborCost < 0) {
      console.log('공임 검사 실패:', laborCost);
      return null;
    }

    // 순도별 비율
    const purityRatios = {
      '14k': 0.6435,
      '18k': 0.825,
      '24k': 1
    };

    try {
      // 기본 원가 계산: (금시세 × (중량/3.75) × 순도비율) + 공임
      const goldValue = currentGoldPrice * (weight / 3.75) * purityRatios[inputs.purity];
      const baseCost = goldValue + laborCost;

      console.log('계산 과정:', {
        goldValue,
        baseCost,
        purityRatio: purityRatios[inputs.purity],
        marginRate: marginSettings[inputs.purity]
      });

      // NaN 체크
      if (isNaN(baseCost) || !isFinite(baseCost)) {
        console.log('기본 원가 NaN:', baseCost);
        return null;
      }

      // 마진율 적용
      const marginRate = marginSettings[inputs.purity] / 100;
      const regularPrice = baseCost * (1 + marginRate);

      // 할인가 계산 (마진율에서 3% 차감)
      const discountMarginRate = Math.max(0, marginRate - 0.03); // 3% 할인
      const discountPrice = baseCost * (1 + discountMarginRate);

      // 순이익 계산
      const regularProfit = regularPrice - baseCost;
      const discountProfit = discountPrice - baseCost;

      // 순이익률 계산 (0으로 나누기 방지)
      const regularProfitRate = regularPrice > 0 ? Math.round((regularProfit / regularPrice) * 100) : 0;
      const discountProfitRate = discountPrice > 0 ? Math.round((discountProfit / discountPrice) * 100) : 0;

      // 최종 결과 검증
      const result = {
        baseCost,
        regularPrice,
        discountPrice,
        regularProfit,
        discountProfit,
        regularProfitRate,
        discountProfitRate
      };

      console.log('최종 결과:', result);

      // 모든 값이 유효한 숫자인지 확인
      const isValidResult = Object.values(result).every(value => 
        typeof value === 'number' && isFinite(value) && !isNaN(value)
      );

      console.log('결과 유효성:', isValidResult);

      return isValidResult ? result : null;
    } catch (error) {
      console.error('계산 중 오류 발생:', error);
      return null;
    }
  };

  const result = calculatePrice();

  // 로컬 스토리지 저장
  useEffect(() => {
    localStorage.setItem('goldPrice', JSON.stringify(goldPrice));
  }, [goldPrice]);

  useEffect(() => {
    localStorage.setItem('marginSettings', JSON.stringify(marginSettings));
  }, [marginSettings]);

  const handleSaveSettings = () => {
    setGoldPrice({
      ...tempGoldPrice,
      lastUpdated: new Date().toLocaleString('ko-KR')
    });
    setMarginSettings(tempMarginSettings);
    setShowSettings(false);
    toast({
      title: "설정이 저장되었습니다",
      description: "새로운 금시세와 마진 설정이 적용되었습니다.",
    });
  };

  const formatNumber = (num: number) => {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    return new Intl.NumberFormat('ko-KR').format(Math.round(num));
  };

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="card-gradient border-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-gradient-gold rounded-full animate-float">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                주얼리 가격 산정
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              실시간 금시세 기반 정확한 가격 계산
            </CardDescription>
            {goldPrice.lastUpdated && (
              <Badge variant="outline" className="mx-auto">
                마지막 업데이트: {goldPrice.lastUpdated}
              </Badge>
            )}
          </CardHeader>
        </Card>

        {/* 설정 버튼 */}
        <div className="flex justify-end">
          <Button
            variant="gold"
            size="lg"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
            설정
          </Button>
        </div>

        {/* 설정 패널 */}
        {showSettings && (
          <Card className="card-gradient border-border">
            <CardHeader>
              <CardTitle className="text-gold">금시세 및 마진 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gold-light">금시세 설정 (3.75g 기준)</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="vatPrice">부가세 포함 금시세 (원)</Label>
                      <Input
                        id="vatPrice"
                        type="number"
                        value={tempGoldPrice.vatPrice}
                        onChange={(e) => setTempGoldPrice({
                          ...tempGoldPrice,
                          vatPrice: parseFloat(e.target.value) || 0
                        })}
                        className="text-lg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cashPrice">현금 금시세 (원)</Label>
                      <Input
                        id="cashPrice"
                        type="number"
                        value={tempGoldPrice.cashPrice}
                        onChange={(e) => setTempGoldPrice({
                          ...tempGoldPrice,
                          cashPrice: parseFloat(e.target.value) || 0
                        })}
                        className="text-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gold-light">최대 마진 설정 (%)</h3>
                  <p className="text-sm text-muted-foreground">최대 할인가는 각 마진율에서 3% 차감하여 자동 계산됩니다.</p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="margin14k">14K 최대 마진율</Label>
                      <Input
                        id="margin14k"
                        type="number"
                        value={tempMarginSettings.k14}
                        onChange={(e) => setTempMarginSettings({
                          ...tempMarginSettings,
                          k14: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="margin18k">18K 최대 마진율</Label>
                      <Input
                        id="margin18k"
                        type="number"
                        value={tempMarginSettings.k18}
                        onChange={(e) => setTempMarginSettings({
                          ...tempMarginSettings,
                          k18: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="margin24k">24K 최대 마진율</Label>
                      <Input
                        id="margin24k"
                        type="number"
                        value={tempMarginSettings.k24}
                        onChange={(e) => setTempMarginSettings({
                          ...tempMarginSettings,
                          k24: parseFloat(e.target.value) || 0
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  취소
                </Button>
                <Button variant="gold" onClick={handleSaveSettings}>
                  저장
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 계산 입력 */}
        <Card className="card-gradient border-border">
          <CardHeader>
            <CardTitle className="text-gold">가격 계산</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 금 순도 선택 */}
            <div>
              <Label className="text-base font-semibold mb-3 block">금 순도</Label>
              <Tabs value={inputs.purity} onValueChange={(value) => setInputs({...inputs, purity: value as any})}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="14k" className="text-base font-medium">14K</TabsTrigger>
                  <TabsTrigger value="18k" className="text-base font-medium">18K</TabsTrigger>
                  <TabsTrigger value="24k" className="text-base font-medium">24K</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 금시세 타입 선택 */}
            <div>
              <Label className="text-base font-semibold mb-3 block">금시세 유형</Label>
              <Tabs value={inputs.priceType} onValueChange={(value) => setInputs({...inputs, priceType: value as any})}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vat" className="text-base font-medium">부가세 포함</TabsTrigger>
                  <TabsTrigger value="cash" className="text-base font-medium">현금 가격</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="weight" className="text-base font-semibold">중량 (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.001"
                  value={inputs.weight}
                  onChange={(e) => setInputs({...inputs, weight: e.target.value})}
                  placeholder="0.000"
                  className="text-lg h-12"
                />
              </div>
              <div>
                <Label htmlFor="laborCost" className="text-base font-semibold">공임 (원)</Label>
                <Input
                  id="laborCost"
                  type="number"
                  value={inputs.laborCost}
                  onChange={(e) => setInputs({...inputs, laborCost: e.target.value})}
                  placeholder="0"
                  className="text-lg h-12"
                />
              </div>
            </div>

            {/* 현재 금시세 표시 */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">현재 적용 금시세 (3.75g 기준)</div>
              <div className="text-xl font-bold text-gold">
                {(() => {
                  const currentGoldPrice = inputs.priceType === 'vat' ? goldPrice.vatPrice : goldPrice.cashPrice;
                  return currentGoldPrice > 0 ? formatNumber(currentGoldPrice) + '원' : '금시세를 설정해주세요';
                })()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 계산 결과 */}
        {result && (
          <Card className="card-gradient border-border animate-glow">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                계산 결과
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 일반 판매가 */}
                <div className="space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gold" />
                    <h3 className="text-lg font-semibold text-gold-light">일반 판매가</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-foreground">
                      {formatNumber(result.regularPrice)}원
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">순이익</span>
                        <span className="font-semibold text-success">+{formatNumber(result.regularProfit)}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">수익률</span>
                        <span className="font-semibold text-success">{result.regularProfitRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 할인 판매가 */}
                <div className="space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-warning" />
                    <h3 className="text-lg font-semibold text-warning">최대 할인가</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold text-foreground">
                      {formatNumber(result.discountPrice)}원
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">순이익</span>
                        <span className="font-semibold text-warning">+{formatNumber(result.discountProfit)}원</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">수익률</span>
                        <span className="font-semibold text-warning">{result.discountProfitRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 원가 정보 */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">원가 정보</div>
                <div className="text-lg font-semibold">
                  기본 원가: {formatNumber(result.baseCost)}원
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  (금값: {formatNumber(Math.max(0, result.baseCost - parseFloat(inputs.laborCost || '0')))}원 + 공임: {formatNumber(parseFloat(inputs.laborCost || '0'))}원)
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 실시간 계산 결과 또는 안내 메시지 */}
        <Card className="card-gradient border-border">
          <CardContent className="text-center py-8">
            {inputs.weight && parseFloat(inputs.weight) > 0 && ((goldPrice.vatPrice > 0) || (goldPrice.cashPrice > 0)) ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <TrendingUp className="h-6 w-6 text-gold" />
                  <h3 className="text-2xl font-bold text-gold">실시간 가격 계산</h3>
                </div>
                
                {(() => {
                  // 입력값들 가져오기
                  const weight = parseFloat(inputs.weight) || 0;
                  const laborCost = parseFloat(inputs.laborCost) || 0;
                  const currentGoldPrice = inputs.priceType === 'vat' ? goldPrice.vatPrice : goldPrice.cashPrice;
                  const purityRatios = { '14k': 0.6435, '18k': 0.825, '24k': 1 };
                  
                  // 현재 선택된 순도의 마진율 가져오기
                  const currentMarginPercent = marginSettings[inputs.purity] || 0;
                  
                  // 기본 원가 계산: (금시세 × (중량/3.75) × 순도비율) + 공임
                  const goldValue = currentGoldPrice * (weight / 3.75) * purityRatios[inputs.purity];
                  const baseCost = goldValue + laborCost;
                  
                  // 일반 판매가 = 기본 원가 × (1 + 마진율/100)
                  const regularPrice = baseCost * (1 + currentMarginPercent / 100);
                  
                  // 최대 할인가 = 기본 원가 × (1 + (마진율-3)/100)
                  const discountMarginPercent = Math.max(0, currentMarginPercent - 3);
                  const discountPrice = baseCost * (1 + discountMarginPercent / 100);
                  
                  // 순이익 계산
                  const regularProfit = regularPrice - baseCost;
                  const discountProfit = discountPrice - baseCost;
                  
                  // 수익률 계산
                  const regularProfitRate = regularPrice > 0 ? Math.round((regularProfit / regularPrice) * 100) : 0;
                  const discountProfitRate = discountPrice > 0 ? Math.round((discountProfit / discountPrice) * 100) : 0;
                  
                  return (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* 일반 판매가 */}
                        <div className="p-6 bg-gradient-card rounded-lg border border-border">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <DollarSign className="h-5 w-5 text-gold" />
                            <h4 className="text-lg font-semibold text-gold-light">일반 판매가</h4>
                          </div>
                          <div className="text-3xl font-bold text-foreground mb-3">
                            {formatNumber(regularPrice)}원
                          </div>
                          <Separator className="mb-3" />
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">적용 마진율</span>
                              <span className="font-semibold text-gold">{currentMarginPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">순이익</span>
                              <span className="font-semibold text-success">+{formatNumber(regularProfit)}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">수익률</span>
                              <span className="font-semibold text-success">{regularProfitRate}%</span>
                            </div>
                          </div>
                        </div>

                        {/* 최대 할인가 */}
                        <div className="p-6 bg-gradient-card rounded-lg border border-border">
                          <div className="flex items-center justify-center gap-2 mb-4">
                            <DollarSign className="h-5 w-5 text-warning" />
                            <h4 className="text-lg font-semibold text-warning">최대 할인가</h4>
                          </div>
                          <div className="text-3xl font-bold text-foreground mb-3">
                            {formatNumber(discountPrice)}원
                          </div>
                          <Separator className="mb-3" />
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">적용 마진율</span>
                              <span className="font-semibold text-warning">{discountMarginPercent}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">순이익</span>
                              <span className="font-semibold text-warning">+{formatNumber(discountProfit)}원</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">수익률</span>
                              <span className="font-semibold text-warning">{discountProfitRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 원가 정보 */}
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground mb-2">원가 정보</div>
                        <div className="text-lg font-semibold">
                          기본 원가: {formatNumber(baseCost)}원
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          (금값: {formatNumber(goldValue)}원 + 공임: {formatNumber(laborCost)}원)
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          계산식: {formatNumber(currentGoldPrice)}원 × ({weight}g ÷ 3.75g) × {purityRatios[inputs.purity]} + {formatNumber(laborCost)}원
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-4">
                <Calculator className="h-12 w-12 text-gold mx-auto animate-pulse" />
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    중량을 입력하고 금시세를 설정하면 가격이 자동으로 계산됩니다.
                  </p>
                  {(!goldPrice.vatPrice && !goldPrice.cashPrice) && (
                    <p className="text-warning text-sm">
                      ⚠️ 먼저 설정에서 금시세를 입력해주세요.
                    </p>
                  )}
                  {(!inputs.weight || parseFloat(inputs.weight) <= 0) && goldPrice.vatPrice > 0 && (
                    <p className="text-warning text-sm">
                      ⚠️ 중량을 정확히 입력해주세요.
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JewelryCalculator;