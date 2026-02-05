"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { FiSearch, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, GiftSet, ReciprocateItem, ProductType } from "@/types";
import { productService } from "@/services/products";
import { getStorageUrl } from "@/lib/supabase";

interface SearchResult {
  id: string;
  name: string;
  price: number;
  image_url: string;
  productType: ProductType;
  category: string;
}

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
`;

const SearchContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  z-index: 2001;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const SearchWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
`;

const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #f8f8f8;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #f35525;
    background-color: #ffffff;
  }
`;

const SearchIcon = styled.div`
  color: #666666;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: #1e1e1e;
  outline: none;

  &::placeholder {
    color: #999999;
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: #666666;
  transition: all 0.2s ease;

  &:hover {
    background-color: #eeeeee;
    color: #1e1e1e;
  }
`;

const ResultsContainer = styled(motion.div)`
  margin-top: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const ResultsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ResultItem = styled(motion.li)<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "#fff5f2" : "transparent"};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f8f8;
  }
`;

const ResultImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f8f8f8;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ResultInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ResultName = styled.p`
  font-size: 0.9375rem;
  font-weight: 500;
  color: #1e1e1e;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
`;

const ResultCategory = styled.span`
  font-size: 0.75rem;
  color: #999999;
`;

const ResultPrice = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #f35525;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666666;
`;

const SearchHint = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999999;
  font-size: 0.875rem;
`;

const CategoryLabel = styled.span`
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.6875rem;
  font-weight: 500;
  background-color: #f0f0f0;
  color: #666666;
`;

const categoryLabels: Record<string, string> = {
  chapssaltteok: "찹쌀떡",
  mepssaltteok: "멥쌀떡",
  tteokguk: "떡국떡",
  others: "기타",
  gift_set: "선물세트",
  songpyeon_set: "송편세트",
  baekil_dol_set: "백일/돌세트",
  ibaji: "이바지",
  daprye: "답례",
};

const productTypeLabels: Record<ProductType, string> = {
  menu_item: "대표메뉴",
  gift_set: "선물세트",
  reciprocate_item: "이바지/답례",
};

const getProductLink = (productType: ProductType, id: string): string => {
  switch (productType) {
    case "menu_item":
      return `/represent/${id}`;
    case "gift_set":
      return `/gifts/${id}`;
    case "reciprocate_item":
      return `/reciprocate/${id}`;
    default:
      return "/";
  }
};

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 검색 실행
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const [menuItems, giftSets, reciprocateItems] = await Promise.all([
        productService.getMenuItems(),
        productService.getGiftSets(),
        productService.getReciprocateItems(),
      ]);

      const searchLower = searchQuery.toLowerCase();

      const menuResults: SearchResult[] = menuItems
        .filter(
          (item: MenuItem) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        )
        .map((item: MenuItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          productType: "menu_item" as ProductType,
          category: item.category,
        }));

      const giftResults: SearchResult[] = giftSets
        .filter(
          (item: GiftSet) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.items?.some((i) => i.toLowerCase().includes(searchLower))
        )
        .map((item: GiftSet) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          productType: "gift_set" as ProductType,
          category: item.category,
        }));

      const reciprocateResults: SearchResult[] = reciprocateItems
        .filter(
          (item: ReciprocateItem) =>
            item.name.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower)
        )
        .map((item: ReciprocateItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
          productType: "reciprocate_item" as ProductType,
          category: item.category,
        }));

      setResults([...menuResults, ...giftResults, ...reciprocateResults]);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 디바운스 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // 열릴 때 input에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESC 키 처리
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  // 결과 선택
  const handleSelect = (result: SearchResult) => {
    const link = getProductLink(result.productType, result.id);
    router.push(link);
    onClose();
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  // 닫기
  const handleClose = () => {
    onClose();
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR") + "원";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
          />
          <SearchContainer
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <SearchWrapper>
              <SearchInputWrapper>
                <SearchIcon>
                  <FiSearch />
                </SearchIcon>
                <SearchInput
                  ref={inputRef}
                  type="text"
                  placeholder="상품명, 카테고리로 검색하세요..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <CloseButton onClick={handleClose} aria-label="검색 닫기">
                  <FiX />
                </CloseButton>
              </SearchInputWrapper>

              <AnimatePresence mode="wait">
                {query.trim() === "" ? (
                  <SearchHint
                    key="hint"
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    찹쌀떡, 선물세트, 이바지 등을 검색해보세요
                  </SearchHint>
                ) : isLoading ? (
                  <SearchHint
                    key="loading"
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    검색 중...
                  </SearchHint>
                ) : results.length > 0 ? (
                  <ResultsContainer
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <ResultsList>
                      {results.map((result, index) => (
                        <ResultItem
                          key={`${result.productType}-${result.id}`}
                          $isSelected={index === selectedIndex}
                          onClick={() => handleSelect(result)}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <ResultImage>
                            <img src={getStorageUrl(result.image_url)} alt={result.name} />
                          </ResultImage>
                          <ResultInfo>
                            <ResultName>{result.name}</ResultName>
                            <ResultMeta>
                              <CategoryLabel>
                                {productTypeLabels[result.productType]}
                              </CategoryLabel>
                              <ResultCategory>
                                {categoryLabels[result.category] ||
                                  result.category}
                              </ResultCategory>
                            </ResultMeta>
                          </ResultInfo>
                          <ResultPrice>{formatPrice(result.price)}</ResultPrice>
                        </ResultItem>
                      ))}
                    </ResultsList>
                  </ResultsContainer>
                ) : (
                  <NoResults
                    key="no-results"
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    &quot;{query}&quot;에 대한 검색 결과가 없습니다
                  </NoResults>
                )}
              </AnimatePresence>
            </SearchWrapper>
          </SearchContainer>
        </>
      )}
    </AnimatePresence>
  );
}
