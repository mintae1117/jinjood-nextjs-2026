UPDATE menu_items SET price = 45000, description = '쫄깃한 찹쌀 피에 직접 만들어 배합한 팥앙금이 일품!! 수능선물로 최고에요!! (1되/36개입)' WHERE name = '모찌';

UPDATE menu_items SET description = '임금님께 진상하던 귀한 떡! 여러가지 견과류가 기피앙금과 함께 들어가 고급스러운 맛! (16개입)' WHERE name = '두텁';

UPDATE menu_items SET price = 60000 WHERE name = '영양찰밥';

UPDATE menu_items SET price = 32000 WHERE name = '콩시루';

UPDATE menu_items SET price = 20000 WHERE name = '가래떡';

UPDATE gift_sets SET name = '떡케이크 3~5호', price = 35000, description = '생일, 칠순, 팔순등 행사용 떡케이크! 케이크 호수 증가에 따라 5,000원씩 추가 됩니다! (35,000원 ~ 45,000원)' WHERE name = '떡케이크 2~5호';

UPDATE gift_sets SET price = 20000 WHERE name = '떡국세트 1호';

UPDATE gift_sets SET price = 70000, description = '(百/첫돌)무늬 백설기 27개(꿀추가 선택가능), 오색손송편 1kg, 수수팥떡 1kg', items = ARRAY['무늬 백설기 27개', '오색손송편 1kg', '수수팥떡 1kg'] WHERE name = '백일&돌세트 1호';

UPDATE reciprocate_items SET price = 3700 WHERE name = '답례품 1호';

UPDATE reciprocate_items SET price = 3400 WHERE name = '답례품 2호';

UPDATE reciprocate_items SET price = 4600 WHERE name = '답례품 3호';

UPDATE reciprocate_items SET price = 5900 WHERE name = '답례품 4호';

UPDATE reciprocate_items SET price = 7500 WHERE name = '답례품 5호';
