import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, ShoppingCart } from 'lucide-react';
import SalesPriceCalculator from './SalesPriceCalculator';
import PurchasePriceCalculator from './PurchasePriceCalculator';

const JewelryCalculator = () => {
  // 로컬 스토리지에서 금시세 정보 가져오기 (헤더 표시용)
  const getGoldPriceInfo = () => {
    const saved = localStorage.getItem('goldPrice');
    return saved ? JSON.parse(saved) : { lastUpdated: '' };
  };

  const goldPriceInfo = getGoldPriceInfo();

  return (
    <div className="min-h-screen p-4 md:p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="border-border">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold">
                주얼리 가격 산정
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              실시간 금시세 기반 정확한 가격 계산
            </CardDescription>
            {goldPriceInfo.lastUpdated && (
              <Badge variant="outline" className="mx-auto">
                마지막 업데이트: {goldPriceInfo.lastUpdated}
              </Badge>
            )}
          </CardHeader>
        </Card>

        {/* 메인 탭 네비게이션 */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sales" className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              판매가 계산
            </TabsTrigger>
            <TabsTrigger value="purchase" className="text-base font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              매입가 계산
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <SalesPriceCalculator />
          </TabsContent>

          <TabsContent value="purchase">
            <PurchasePriceCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default JewelryCalculator;