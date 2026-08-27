import React from 'react';
import SearchMenuBox from './SearchMenuBox';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  return <SearchMenuBox isOpen={isOpen} onClose={onClose} variant="desktop" />;
};

export default SearchOverlay;
