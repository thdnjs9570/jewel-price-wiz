import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JewelryCalculator from "./JewelryCalculator";
import PurchaseCalculator from "./PurchaseCalculator";

const CalculatorTabs = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="selling" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="selling">판매 가격 계산기</TabsTrigger>
            <TabsTrigger value="purchase">매입가 계산기</TabsTrigger>
          </TabsList>
          
          <TabsContent value="selling" className="space-y-6">
            <JewelryCalculator />
          </TabsContent>
          
          <TabsContent value="purchase" className="space-y-6">
            <PurchaseCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CalculatorTabs;