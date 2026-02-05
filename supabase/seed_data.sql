-- =====================================================
-- Jinjood 상품 데이터 Seed SQL
-- Supabase SQL Editor에서 실행하세요
--
-- 이미지 URL은 Supabase Storage에 업로드 후 수정 필요
-- 현재는 placeholder로 /images/... 경로 사용
-- =====================================================

-- 기존 데이터 삭제 (필요시 주석 해제)
-- TRUNCATE menu_items, gift_sets, reciprocate_items, banners RESTART IDENTITY CASCADE;

-- =====================================================
-- 1. 대표 메뉴 (menu_items) - represent.html 기준
-- =====================================================

-- 멥쌀떡 (mepssaltteok)
INSERT INTO menu_items (name, price, description, image_url, category, tags, is_popular, is_recommended, is_best, display_order) VALUES
('꿀백설기', 28000, '부드러우면서 쫄깃한 식감이 일품인 하얀 백설기! 가운데에 꿀이 사르르~ (1되/40개입)', '/images/menu/menu001.avif', 'mepssaltteok', ARRAY['추천', '인기', '베스트'], true, true, true, 1),
('단호박편', 40000, '물 없이 ONLY!! 단호박만을 사용하여 만든 담백한 떡! (호두가 들어가요!) (1되/40개입)', '/images/menu/menu002.avif', 'mepssaltteok', ARRAY['추천', '베스트'], false, true, true, 2),
('대추떡', 40000, '24시간 이상 푹 고은 대추 액기스와 달달한 꿀 덕분에 대추향과 달큰함이 가득한 떡! (1되/40개입)', '/images/menu/menu009.avif', 'mepssaltteok', ARRAY['추천'], false, true, false, 9),
('앙꼬절편', 32000, '쫀득한 피가 달콤한 팥앙금을 만나 환상의 조합을 이룬 영양만점 간식입니다! (1되/40개입)', '/images/menu/menu010.avif', 'mepssaltteok', ARRAY['추천', '인기'], true, true, false, 10),
('콩시루', 31000, '국산 노란 콩을 사용하여 적절한 멥쌀과 찹쌀의 비율로 제수용으로 최고의 떡! (1되/40개입)', '/images/menu/menu012.avif', 'mepssaltteok', ARRAY['추천'], false, true, false, 12),
('가래떡', 19000, '해남 메뚜기 쌀만을 사용하여 쫀득 말랑한 식감의 떡! 구워서 꿀이나 설탕에 찍어먹으면 더욱 꿀맛! (1되/2.5kg)', '/images/menu/menu013.avif', 'mepssaltteok', ARRAY['추천', '인기'], true, true, false, 13),
('백설기', 22000, '해남 메뚜기 쌀을 사용해 구수한 향과 쫀득한 식감이 일품인 근본에 충실한 기본중의 기본떡! (1되/40개입)', '/images/menu/ready.png', 'mepssaltteok', ARRAY['인기'], true, false, false, 16),
('바람떡', 30000, '팥앙금이 가득 들어간 쫀득한 3색 반달송편! 아이들 간식으로 최고에요! (1되/2.5kg)', '/images/menu/menu018.avif', 'mepssaltteok', ARRAY['인기'], true, false, false, 18),
('단호박 백설기', 31000, '물 없이 ONLY!! 단호박만을 사용하여 만든 담백한 떡! (새콤달콤 건포도가 들어가요!) (1되/40개입)', '/images/menu/menu019.avif', 'mepssaltteok', ARRAY['추천'], false, true, false, 19),
('손송편', 29000, '남녀노소 가리지않는 4계절 최고의 인기 떡!! 달달한 꿀과 깨가 아주 맛있어요~!! (1되/2.5kg)', '/images/menu/menu020.avif', 'mepssaltteok', ARRAY['추천', '인기', '베스트'], true, true, true, 20),
('녹두송편', 36000, '쫀득한 멥쌀피에 밤같은 녹두앙금과 호두가 들어가 아주 담백하고 맛있어요!! (1되/36개입)', '/images/menu/menu021.avif', 'mepssaltteok', ARRAY['인기'], true, false, false, 21),
('모시기피송편', 40000, '모시잎을 넣어 만든 쫀득한 송편!! 달콤한 기피앙금에 밤, 호두, 검은깨가 들어가요!! (1되/36개입)', '/images/menu/menu022.avif', 'mepssaltteok', ARRAY['베스트'], false, false, true, 22),
('무지개떡', 30000, '알록달록 이쁜 색감이 일품인 떡! 천연색소가 들어가 안전한 아이들 최고의 간식!! (1되/40개입)', '/images/menu/menu033.avif', 'mepssaltteok', ARRAY['인기', '추천', '베스트'], true, true, true, 33);

-- 찹쌀떡 (chapssaltteok)
INSERT INTO menu_items (name, price, description, image_url, category, tags, is_popular, is_recommended, is_best, display_order) VALUES
('꿀떡', 40000, '찹쌀에 달달한 꿀과 여러가지 견과류가 올라가있어요! (캐슈넛, 아몬드가 들어가요!) (1되/40개입)', '/images/menu/menu003.avif', 'chapssaltteok', ARRAY['추천', '인기'], true, true, false, 3),
('약밥', 55000, '진주떡집만의 레시피로 하루동안 숙성을 시킨 찹쌀과 국내산 공주밤, 그리고 가평 잣이 들어간 최고급 약밥! (1되/40개입)', '/images/menu/menu004.avif', 'chapssaltteok', ARRAY['추천', '인기'], true, true, false, 4),
('앙꼬찰떡', 45000, '하얀 기피팥 고물에 달달한 앙금이 들어간 쫀득쫀득한 인기만점 앙꼬찰떡! (1되/40개입)', '/images/menu/menu005.avif', 'chapssaltteok', ARRAY['인기', '베스트'], true, false, true, 5),
('통녹두완두찰시루', 45000, '쫀득한 찰시루떡 사이에 달콤 담백한 완두와 위아래 통녹두의 환상의 조합! (1되/40개입)', '/images/menu/menu006.avif', 'chapssaltteok', ARRAY['인기'], true, false, false, 6),
('흑미모둠', 55000, '흑미 향이 가득한 흑미찹쌀에 콩 땅콩을 넣고 호두를 올려 완성한 모둠떡! (땅콩이 들어가요!) (1되/40개입)', '/images/menu/menu007.avif', 'chapssaltteok', ARRAY['추천'], false, true, false, 7),
('모둠떡(영양떡)', 55000, '다섯가지 종류의 콩과 호박고지, 그리고 국내산 공주 밤을 모두 담은 영양떡! (땅콩이 들어가요!) (1되/40개입)', '/images/menu/menu008.avif', 'chapssaltteok', ARRAY['추천', '인기', '베스트'], true, true, true, 8),
('팥찰시루', 35000, '이사, 개업, 행사 등등에 빠지지 않는 필수떡!! 직접 삶은 팥과 쫀득한 찹쌀피가 일품! (1되/40개입)', '/images/menu/menu011.avif', 'chapssaltteok', ARRAY['인기', '베스트'], true, false, true, 11),
('인절미', 32000, '국내산 콩으로 만든 콩고물과 쫀득한 인절미의 중독성에서 빠져나올수 없는 그 맛! (1되/40개입)', '/images/menu/menu014.avif', 'chapssaltteok', ARRAY['인기', '베스트'], true, false, true, 14),
('기피인절미', 35000, '구수한 향이 일품인 거두기피를 사용해 만들어, 쫀득한 인절미와 찰떡궁합인 떡! (1되/40개입)', '/images/menu/ready.png', 'chapssaltteok', ARRAY['추천'], false, true, false, 15),
('모찌', 42000, '쫄깃한 찹쌀 피에 직접 만들어 배합한 팥앙금이 일품!! 수능선물로 최고에요!! (1되/45개입)', '/images/menu/menu023.avif', 'chapssaltteok', ARRAY['인기', '베스트'], true, false, true, 23),
('두텁', 50000, '임금님께 진상하던 귀한 떡! 여러가지 견과류가 기피앙금과 함께 들어가 고급스러운 맛! (20개입)', '/images/menu/menu024.avif', 'chapssaltteok', ARRAY['추천'], false, true, false, 24),
('영양찰밥', 50000, '수수, 조, 밤, 콩, 땅콩, 잣, 검은깨 등등 여러가지 재료가 들어간 대보름 인기최고 제품! (20개입)', '/images/menu/menu031.avif', 'chapssaltteok', ARRAY['인기'], true, false, false, 31),
('콩찰시루', 34000, '국내산 노란 콩과 찹쌀만을 사용하여 만든 인기만점 근본 떡! 재수용으로 최고!! (1되/40개입)', '/images/menu/menu032.avif', 'chapssaltteok', ARRAY['추천'], false, true, false, 32);

-- 떡국 (tteokguk)
INSERT INTO menu_items (name, price, description, image_url, category, tags, is_popular, is_recommended, is_best, display_order) VALUES
('떡국', 20000, '해남 메뚜기 쌀을 사용해 쫄깃한 맛이 최고인 떡, 자연건조해서 퍼지지 않아요! (11월 ~ 3월 판매) (2.2kg)', '/images/menu/menu017.avif', 'tteokguk', ARRAY['인기', '베스트'], true, false, true, 17);

-- 기타/계절메뉴 (others)
INSERT INTO menu_items (name, price, description, image_url, category, tags, is_popular, is_recommended, is_best, display_order) VALUES
('쑥랩인절미', 30000, '진도쑥을 사용하여 쌀과 함께 갈아 만든 떡! 쑥향 가득한 건강식으로 최고! (계절메뉴) (1되/2.5kg)', '/images/menu/menu025.avif', 'others', ARRAY['추천'], false, true, false, 25),
('쑥인절미', 37000, '쑥향 가득한 제철 진도쑥으로 만든 인절미에 고소한 콩고물을 묻혀 완성한 떡! (계절메뉴) (1되/2.5kg)', '/images/menu/menu026.avif', 'others', ARRAY['인기'], true, false, false, 26),
('쑥설기', 32000, '포실포실한 설기에 쑥이 가득 들어간 대추, 밤 고명이 올라가는 고급스러운 떡! (계절메뉴) (1되/40개입)', '/images/menu/menu027.avif', 'others', ARRAY['추천'], false, true, false, 27),
('쑥절편', 25000, '쑥향이 가득하고 쫄깃한 쑥 절편!! 꿀, 설탕에 찍어 먹으면 더욱 맛있습니다!! (계절메뉴) (1되/2.5kg)', '/images/menu/menu028.avif', 'others', ARRAY['인기', '베스트'], true, false, true, 28),
('모둠잔기증', 38000, '막걸리를 사용하여 정성가득 발효시켜 만든 떡! (밤, 콩, 땅콩이 들어가요!!) (계절메뉴) (1되/30개입)', '/images/menu/menu029.avif', 'others', ARRAY['베스트'], false, false, true, 29),
('팥앙금잔기증', 36000, '막걸리를 사용하여 정성가득 발효시켜 만든 떡! (팥과 앙금이 들어가요!!) (계절메뉴) (1되/30개입)', '/images/menu/menu030.avif', 'others', ARRAY['인기'], true, false, false, 30);


-- =====================================================
-- 2. 선물세트 (gift_sets) - gifts.html 기준
-- =====================================================

-- 선물세트
INSERT INTO gift_sets (name, price, description, image_url, category, items, display_order) VALUES
('선물세트 1호', 39000, '대추떡 10개, 단호박편 10개, 흑미모둠 10개로 구성된 가장 기본적인 선물세트! (1세트/30개입)', '/images/menu/giftset/giftset01.avif', 'gift_set', ARRAY['대추떡 10개', '단호박편 10개', '흑미모둠 10개'], 1),
('선물세트 2호', 44000, '대추떡 12개, 단호박편 12개, 흑미모둠 11개로 구성된 총 35개의 구성품인 선물세트! (1세트/35개입)', '/images/menu/daprae/ready01.png', 'gift_set', ARRAY['대추떡 12개', '단호박편 12개', '흑미모둠 11개'], 2),
('선물세트 3호', 49000, '대추떡 14개, 단호박편 13개, 흑미모둠 13개로 구성된 총 40개의 구성품인 선물세트! (1세트/40개입)', '/images/menu/daprae/ready01.png', 'gift_set', ARRAY['대추떡 14개', '단호박편 13개', '흑미모둠 13개'], 3),
('선물세트 4호', 54000, '대추떡 15개, 단호박편 15개, 흑미모둠 15개로 구성된 총 45개의 구성품인 선물세트! (1세트/45개입)', '/images/menu/giftset/giftset02.avif', 'gift_set', ARRAY['대추떡 15개', '단호박편 15개', '흑미모둠 15개'], 4),
('선물세트 5호', 65000, '대추떡 13개, 단호박편 12개, 흑미모둠 13개, 모둠떡 12개로 구성된 가장 알찬 선물세트! (1세트/50개입)', '/images/menu/daprae/ready01.png', 'gift_set', ARRAY['대추떡 13개', '단호박편 12개', '흑미모둠 13개', '모둠떡 12개'], 5),
('떡케이크 2~5호', 30000, '생일, 칠순, 팔순등 행사용 떡케이크! 케이크 호수 증가에 따라 5,000원씩 추가 됩니다! (30,000원 ~ 45,000원)', '/images/menu/daprae/ready01.png', 'gift_set', ARRAY['떡케이크'], 6);

-- 송편/떡국 세트
INSERT INTO gift_sets (name, price, description, image_url, category, items, display_order) VALUES
('송편세트 1호', 32000, '녹두송편 7개, 오색송편 9개, 모시기피송편 7개로 구성된 총 23개의 구성품인 송편세트! (1세트/23개입)', '/images/menu/giftset/giftset03.avif', 'songpyeon_set', ARRAY['녹두송편 7개', '오색송편 9개', '모시기피송편 7개'], 7),
('송편세트 2호', 47000, '녹두송편 12개, 오색송편 7개, 모둠송편 7개, 모시기피송편 12개로 구성된 가장 알찬 송편세트! (1세트/38개입)', '/images/menu/giftset/giftset05.avif', 'songpyeon_set', ARRAY['녹두송편 12개', '오색송편 7개', '모둠송편 7개', '모시기피송편 12개'], 8),
('떡국세트 1호', 19000, '백미떡국 550g * 1팩, 색깔떡국 550g * 1팩으로 구성된 떡국떡 선물세트!', '/images/menu/giftset/giftset06.avif', 'songpyeon_set', ARRAY['백미떡국 550g 1팩', '색깔떡국 550g 1팩'], 9),
('떡국세트 2호', 25000, '백미떡국 550g * 2팩, 색깔떡국 550g * 1팩으로 구성된 떡국떡 선물세트!', '/images/menu/daprae/ready01.png', 'songpyeon_set', ARRAY['백미떡국 550g 2팩', '색깔떡국 550g 1팩'], 10);

-- 백일/돌 세트
INSERT INTO gift_sets (name, price, description, image_url, category, items, display_order) VALUES
('백일&돌세트 1호', 69000, '(百/첫돌)무늬 백설기 27개(꿀추가 선택가능), 오색손송편 900g, 수수팥떡 900g', '/images/menu/daprae/ready01.png', 'baekil_dol_set', ARRAY['무늬 백설기 27개', '오색손송편 900g', '수수팥떡 900g'], 11),
('백일&돌세트 2호', 79000, '(百/첫돌)무늬 백설기 32개(꿀추가 선택가능), 오색손송편 900g, 수수팥떡 900g', '/images/menu/daprae/ready01.png', 'baekil_dol_set', ARRAY['무늬 백설기 32개', '오색손송편 900g', '수수팥떡 900g'], 12);


-- =====================================================
-- 3. 이바지 & 답례 (reciprocate_items) - reciprocate.html 기준
-- =====================================================

-- 답례품
INSERT INTO reciprocate_items (name, price, description, image_url, category, display_order) VALUES
('답례품 1호', 3300, '(百/첫돌)무늬 백설기, 손송편 두알, 수수팥떡 두알이 들어간 가장 기본적인 답례품! (2구)', '/images/menu/daprae/daprae02_01.avif', 'daprye', 1),
('답례품 2호', 3000, '종합무늬 꿀백설기, 단호박편이 한개씩 들어간 기본적인 답례선물용 2구세트!! (2구)', '/images/menu/daprae/daprae02_02.avif', 'daprye', 2),
('답례품 3호', 4300, '꿀백설기, 단호박편, 흑미모둠이 한개씩 들어간 기본적인 답례선물용 3구세트!! (3구)', '/images/menu/daprae/daprae03_01.avif', 'daprye', 3),
('답례품 4호', 5500, '꿀백설기, 대추떡, 단호박편, 흑미모둠이 한개씩 들어간 답례선물용 4구세트!! (4구)', '/images/menu/daprae/ready01.png', 'daprye', 4),
('답례품 5호', 7100, '꿀백설기, 흑미모둠, 단호박편, 통녹두완두찰시루, 약밥이 한개씩 들어간 답례품 (5구)', '/images/menu/daprae/daprae05_01.avif', 'daprye', 5);

-- 이바지
INSERT INTO reciprocate_items (name, price, description, image_url, category, display_order) VALUES
('이바지 (소)', 85000, '대추떡, 단호박편, 흑미모둠, 모둠떡 총 4가지 종류를 비단바구니에 이쁘게 담아드립니다! (1세트)', '/images/menu/daprae/ready01.png', 'ibaji', 6),
('이바지 (중)', 120000, '대추떡, 단호박편, 흑미모둠, 모둠떡, 약밥 총 5가지 종류를 비단바구니에 이쁘게 담아드립니다! (1세트)', '/images/menu/daprae/ready01.png', 'ibaji', 7),
('이바지 (대)', 180000, '대추떡, 단호박편, 흑미모둠, 모둠떡, 약밥 총 5가지 종류를 비단바구니에 이쁘게 담아드립니다! (1세트)', '/images/menu/daprae/ibagi01.avif', 'ibaji', 8),
('이바지 (VIP)', 230000, '대추떡, 단호박편, 흑미모둠, 모둠, 약밥, 통녹두완두찰시루를 비단바구니 특대에 이쁘게 담아드립니다! (1세트)', '/images/menu/daprae/ready01.png', 'ibaji', 9);


-- =====================================================
-- 4. 배너 (banners) - 홈페이지 히어로 배너
-- =====================================================

INSERT INTO banners (title, subtitle, description, image_url, display_order) VALUES
('품질과 영양', '진주떡집', '국내산 쌀과 엄선된 재료만을 사용하여 정성껏 만듭니다.', '/images/banners/banner001.jpeg', 1),
('매일 신선하게', '당일 생산', '매일 아침 신선하게 만들어 최상의 맛을 제공합니다.', '/images/banners/banner002.jpeg', 2),
('프리미엄 재료', '최고급 원재료', '엄선된 국내산 재료로 건강하고 맛있는 떡을 만듭니다.', '/images/banners/banner003.jpeg', 3);


-- =====================================================
-- 데이터 확인 쿼리
-- =====================================================

-- 메뉴 개수 확인
SELECT
  '메뉴 아이템' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE category = 'mepssaltteok') as 멥쌀떡,
  COUNT(*) FILTER (WHERE category = 'chapssaltteok') as 찹쌀떡,
  COUNT(*) FILTER (WHERE category = 'tteokguk') as 떡국,
  COUNT(*) FILTER (WHERE category = 'others') as 기타
FROM menu_items;

-- 선물세트 개수 확인
SELECT
  '선물세트' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE category = 'gift_set') as 선물세트,
  COUNT(*) FILTER (WHERE category = 'songpyeon_set') as 송편세트,
  COUNT(*) FILTER (WHERE category = 'baekil_dol_set') as 백일돌세트
FROM gift_sets;

-- 이바지/답례 개수 확인
SELECT
  '이바지/답례' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE category = 'daprye') as 답례품,
  COUNT(*) FILTER (WHERE category = 'ibaji') as 이바지
FROM reciprocate_items;

-- 배너 개수 확인
SELECT '배너' as table_name, COUNT(*) as total FROM banners;
