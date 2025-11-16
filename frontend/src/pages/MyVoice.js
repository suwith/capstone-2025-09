import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import SelectBox from '../components/common/SelectBox';
import VoicePack from '../components/common/VoicePack';
import useVoicepackUsage from '../hooks/useVoicepackUsage';
import useUserStore from '../utils/userStore';

const MyVoice = () => {
  const { user } = useUserStore((state) => state);

  // 생성한 보이스팩만 조회
  const [refreshKey, setRefreshKey] = useState(0);
  const { voicepacks, loading, error } = useVoicepackUsage('mine', refreshKey);

  const [filteredPacks, setFilteredPacks] = useState([]);
  const [sortOption, setSortOption] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const handleSearch = () => {
    setCommittedQuery(searchQuery);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    let result = [...voicepacks];

    if (committedQuery) {
      const lower = committedQuery.toLowerCase();
      result = result.filter((pack) => {
        const name = (pack.name || '').toLowerCase();
        const authorName = (pack.authorName || '').toLowerCase();
        return name.includes(lower) || authorName.includes(lower);
      });
    }

    if (sortOption === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'latest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOption === 'oldest') {
      result.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    setFilteredPacks(result);
    setCurrentPage(1);
  }, [voicepacks, sortOption, committedQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPacks.length / itemsPerPage);

  const getEmptyText = () => {
    if (error) {
      return '보이스팩을 불러오는 중 오류가 발생했습니다.';
    }
    if (!voicepacks.length) {
      return '아직 생성한 보이스팩이 없습니다.';
    }
    if (committedQuery && !filteredPacks.length) {
      return '검색 결과가 없습니다.';
    }
    return '보이스팩이 없습니다.';
  };

  return (
    <>
      <h1 className="text-xl font-bold">내 보이스팩 보관함</h1>
      <div className="container mx-auto px-4">
        {/* 상단: 정렬 / 검색 */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-1/2 flex flex-col sm:flex-row gap-2">
            <SelectBox
              value={sortOption}
              onChange={(value) => setSortOption(value)}
              options={[
                { label: '이름순', value: 'name' },
                { label: '최근 등록순', value: 'latest' },
                { label: '오래된 등록순', value: 'oldest' },
              ]}
              placeholder="정렬"
            />

            <div className="flex w-full sm:flex-1 border border-gray-300 px-2 rounded-lg text-sm bg-white mt-1">
              <button
                aria-label="검색 버튼"
                onClick={handleSearch}
                className="mr-2"
                type="button"
              >
                <Search className="w-5 h-5 text-gray-400" />
              </button>
              <input
                type="search"
                placeholder="보이스팩 이름을 검색해보세요."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        <div className="min-h-screen">
          {loading ? (
            <p className="flex justify-center col-span-full text-gray-500 text-md mt-12">
              불러오는 중입니다...
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-9 justify-center">
                {currentItems.length === 0 ? (
                  <p className="flex justify-center col-span-full text-gray-500 text-md mt-12">
                    {getEmptyText()}
                  </p>
                ) : (
                  currentItems.map((pack) => (
                    <VoicePack
                      key={pack.id}
                      pack={pack}
                      type="mypage"
                      filter="mine"
                      onRefresh={handleRefresh}
                    />
                  ))
                )}
              </div>

              {/* 페이지네이션 UI */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      aria-label="페이지 번호 버튼"
                      key={index}
                      onClick={() => {
                        setCurrentPage(index + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === index + 1
                          ? 'bg-indigo-400 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      type="button"
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MyVoice;
