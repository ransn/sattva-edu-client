import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

type OnSearchHandler = (searchText: string) => void;

interface StudentsFiltersProps {
  onSearch?:OnSearchHandler
}
export function StudentsFilters({
  onSearch,
}:StudentsFiltersProps): React.JSX.Element {

  const [searchText, setSearchText] = React.useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value); // Update the searchText state
    if(onSearch){
      onSearch(value); // Optionally call the search function immediately
    }
  }

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        defaultValue=""
        fullWidth
        placeholder="Search student"
        value={searchText}
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '250px', maxHeight:'35px' }}
        onChange={handleChange}
      />
    </Card>
  );
}
