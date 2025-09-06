import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

const PurchaseCalculator = () => {
  const [goldPrice, setGoldPrice] = useState<string>("");
  const [purity, setPurity] = useState<"14K" | "18K">("14K");
  const [weight, setWeight] = useState<string>("");
  const [purchaseAmount, setPurchaseAmount] = useState<number>(0);

  // 실시간 계산
  useEffect(() => {
    const calculateAmount = () => {
      const price = parseFloat(goldPrice);
      const weightValue = parseFloat(weight);
      
      if (!price || !weightValue || price <= 0 || weightValue <= 0) {
        setPurchaseAmount(0);
        return;
      }

      let multiplier;
      if (purity === "14K") {
        multiplier = 0.55;
      } else {
        multiplier = 0.72;
      }

      const result = (weightValue / 3.75) * multiplier * price;
      setPurchaseAmount(Math.floor(result));
    };

    calculateAmount();
  }, [goldPrice, purity, weight]);

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return `마지막 업데이트: ${now.getFullYear()}. ${now.getMonth() + 1}. ${now.getDate()}. 오후 ${now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">매입가 계산기</h1>
              <p className="text-muted-foreground">실시간 금시세 기반 정확한 가격 계산</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{getCurrentDateTime()}</p>
        </CardContent>
      </Card>

      {/* 계산기 */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">가격 계산</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 금 순도 (14K/18K만) */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">금 순도</Label>
            <div className="flex space-x-2">
              <Button
                variant={purity === "14K" ? "default" : "secondary"}
                onClick={() => setPurity("14K")}
                className="flex-1"
              >
                14K
              </Button>
              <Button
                variant={purity === "18K" ? "default" : "secondary"}
                onClick={() => setPurity("18K")}
                className="flex-1"
              >
                18K
              </Button>
            </div>
          </div>

          {/* 당일 금 매입 시세 */}
          <div className="space-y-2">
            <Label htmlFor="goldPrice" className="text-sm font-medium text-foreground">
              당일 금 매입 시세 (원/g)
            </Label>
            <Input
              id="goldPrice"
              type="number"
              value={goldPrice}
              onChange={(e) => setGoldPrice(e.target.value)}
              placeholder="당일 금 매입 시세를 입력하세요"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              min="0"
            />
          </div>

          {/* 금 중량 */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-sm font-medium text-foreground">
              중량 (g)
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="중량을 입력하세요 (g)"
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              step="0.01"
              min="0"
            />
          </div>

          {/* 결과 */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              현재 적용 금시세 ({weight ? `${weight}g` : '0g'} 기준)
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatNumber(purchaseAmount)}원
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 하단 안내 */}
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">
            중량을 입력하고 금시세를 설정하면 가격이 자동으로 계산됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseCalculator;