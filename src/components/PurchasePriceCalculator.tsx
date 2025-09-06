import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator } from 'lucide-react';

interface PurchaseInputs {
  purchasePrice: string;
  purity: '14k' | '18k';
  weight: string;
}

const PurchasePriceCalculator = () => {
  const [inputs, setInputs] = useState<PurchaseInputs>({
    purchasePrice: '',
    purity: '14k',
    weight: ''
  });

  // 매입가 계산 로직
  const calculatePurchaseAmount = (): number | null => {
    const purchasePrice = parseFloat(inputs.purchasePrice || '0');
    const weight = parseFloat(inputs.weight || '0');

    // 입력값 유효성 검사
    if (!inputs.purchasePrice || inputs.purchasePrice.trim() === '' || isNaN(purchasePrice) || purchasePrice <= 0) {
      return null;
    }
    
    if (!inputs.weight || inputs.weight.trim() === '' || isNaN(weight) || weight <= 0) {
      return null;
    }

    try {
      // 순도별 계수
      const purityMultipliers = {
        '14k': 0.55,
        '18k': 0.72
      };

      // 매입금액 계산: (중량 / 3.75) * 순도계수 * 금매입시세
      const purchaseAmount = (weight / 3.75) * purityMultipliers[inputs.purity] * purchasePrice;

      // NaN 체크
      if (isNaN(purchaseAmount) || !isFinite(purchaseAmount)) {
        return null;
      }

      // 소수점 버림 처리
      return Math.floor(purchaseAmount);
    } catch (error) {
      console.error('매입가 계산 중 오류 발생:', error);
      return null;
    }
  };

  const result = calculatePurchaseAmount();

  const formatNumber = (num: number) => {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return '0';
    }
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>매입가 계산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 당일 금 매입 시세 */}
          <div>
            <Label htmlFor="purchasePrice" className="text-base font-semibold">당일 금 매입 시세 (원/g)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) => setInputs({...inputs, purchasePrice: e.target.value})}
              placeholder="당일 금 매입 시세를 입력하세요"
              className="text-lg h-12"
            />
          </div>

          {/* 금 순도 선택 - 토글 스위치 */}
          <div>
            <Label className="text-base font-semibold mb-3 block">금 순도</Label>
            <div className="flex bg-muted p-1 rounded-lg w-fit">
              <Button
                variant={inputs.purity === '14k' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputs({...inputs, purity: '14k'})}
                className="px-6"
              >
                14K
              </Button>
              <Button
                variant={inputs.purity === '18k' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputs({...inputs, purity: '18k'})}
                className="px-6"
              >
                18K
              </Button>
            </div>
          </div>

          {/* 금 중량 */}
          <div>
            <Label htmlFor="weight" className="text-base font-semibold">금 중량 (g)</Label>
            <Input
              id="weight"
              type="number"
              step="0.001"
              value={inputs.weight}
              onChange={(e) => setInputs({...inputs, weight: e.target.value})}
              placeholder="중량을 입력하세요 (g)"
              className="text-lg h-12"
            />
          </div>

          {/* 계산 공식 안내 */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">계산 공식</div>
            <div className="text-sm font-mono">
              {inputs.purity === '14k' 
                ? '매입금액 = (중량 ÷ 3.75) × 0.55 × 금매입시세'
                : '매입금액 = (중량 ÷ 3.75) × 0.72 × 금매입시세'
              }
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              * 소수점은 버림 처리됩니다
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계산 결과 */}
      {result !== null && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              매입 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 매입 금액 */}
              <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatNumber(result)}원
                </div>
                <Badge variant="secondary" className="text-sm">
                  {inputs.purity.toUpperCase()} 순도 기준
                </Badge>
              </div>

              {/* 계산 상세 정보 */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">계산 상세</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">금 매입 시세</span>
                    <span className="font-medium">{formatNumber(parseFloat(inputs.purchasePrice || '0'))}원/g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">금 중량</span>
                    <span className="font-medium">{inputs.weight}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">금 순도</span>
                    <span className="font-medium">{inputs.purity.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">순도 계수</span>
                    <span className="font-medium">{inputs.purity === '14k' ? '0.55' : '0.72'}</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="text-xs text-muted-foreground">
                      계산: ({inputs.weight} ÷ 3.75) × {inputs.purity === '14k' ? '0.55' : '0.72'} × {formatNumber(parseFloat(inputs.purchasePrice || '0'))} = {formatNumber(result)}원
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 입력값이 없을 때 안내 메시지 */}
      {result === null && (inputs.purchasePrice || inputs.weight) && (
        <Card className="border-border border-dashed">
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground">
              모든 필드를 올바르게 입력해주세요
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              금 매입 시세와 중량은 0보다 큰 값이어야 합니다
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PurchasePriceCalculator;