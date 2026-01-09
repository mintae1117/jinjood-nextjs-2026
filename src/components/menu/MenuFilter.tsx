"use client";

import styled from "styled-components";
import { motion } from "framer-motion";

const FilterWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 3rem;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const FilterButton = styled(motion.button)<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  border-radius: 30px;
  background-color: ${({ $active }) => ($active ? "#f35525" : "#f8f8f8")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#666666")};
  border: 1px solid ${({ $active }) => ($active ? "#f35525" : "#eeeeee")};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ $active }) => ($active ? "#d94820" : "#eeeeee")};
    border-color: ${({ $active }) => ($active ? "#d94820" : "#dddddd")};
  }

  @media (max-width: 640px) {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
  }
`;

interface FilterOption {
  value: string;
  label: string;
}

interface MenuFilterProps {
  filters: FilterOption[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function MenuFilter({
  filters,
  activeFilter,
  onFilterChange,
}: MenuFilterProps) {
  return (
    <FilterWrapper>
      {filters.map((filter) => (
        <FilterButton
          key={filter.value}
          $active={activeFilter === filter.value}
          onClick={() => onFilterChange(filter.value)}
          whileTap={{ scale: 0.95 }}
        >
          {filter.label}
        </FilterButton>
      ))}
    </FilterWrapper>
  );
}
