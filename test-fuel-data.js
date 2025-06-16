
const { createClient } = require("@supabase/supabase-js");

// Supabase 설정
const supabaseUrl = "https://ooqexropurnslqmcbjqk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcWV4cm9wdXJuc2xxbWNianFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0NzQyMDUsImV4cCI6MjA2MzA1MDIwNX0.yXVabtxZwX3QFF6xnjmj5VI2Lrp_7fZ3HvS5dCalbuA";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFuelData() {
  console.log("🔍 극진이앤지 연료 데이터 확인 중...");
  
  try {
    const { data, error } = await supabase
      .from("fuel_transactions")
      .select("*")
      .order("transfer_date", { ascending: false })
      .limit(10);
      
    if (error) {
      console.error("❌ 오류:", error.message);
      return;
    }
    
    console.log("✅ 총 " + data.length + "개 레코드 조회됨");
    
    if (data.length > 0) {
      console.log("📋 최근 데이터 샘플:");
      data.forEach(row => {
        console.log("날짜: " + row.transfer_date + ", 유종: " + row.fuel_type + ", 발주처: " + row.delivery_destination + ", 총액: " + (row.sale_total_amount?.toLocaleString() || 0) + "원");
      });
      
      // 6월 데이터 확인
      const { data: juneData, error: juneError } = await supabase
        .from("fuel_transactions")
        .select("*")
        .gte("transfer_date", "2025-06-01")
        .lte("transfer_date", "2025-06-30")
        .order("transfer_date", { ascending: true });
        
      if (\!juneError && juneData) {
        console.log("🗓️ 6월 데이터: " + juneData.length + "개 레코드");
        if (juneData.length > 0) {
          console.log("  첫 5개 데이터:");
          juneData.slice(0, 5).forEach(row => {
            console.log("    " + row.transfer_date + ": " + row.fuel_type + " - " + (row.sale_total_amount?.toLocaleString() || 0) + "원");
          });
        }
      }
    } else {
      console.log("⚠️ 데이터가 없습니다.");
    }
    
  } catch (err) {
    console.error("❌ 예외 발생:", err);
  }
}

checkFuelData();

