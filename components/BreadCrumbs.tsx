import React, { useEffect } from 'react';
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/react";
import { FaHome, FaChevronRight } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';
import { useStoreMulti } from '@/lib/store';

const BreadCrumbs: React.FC = () => {
	const { currentPath, setCurrentPath, refreshFiles } = useStoreMulti('currentPath', 'setCurrentPath', 'refreshFiles');

	const searchParams = useSearchParams();

	const pathSegments = currentPath.split('/').filter(Boolean);

	const handleClick = (index: number) => {
		const newPath = index === -1 ? '/' : '/' + pathSegments.slice(0, index + 1).join('/');
		setCurrentPath(newPath);
		refreshFiles();
	};

	useEffect(() => {
		const p = searchParams?.get('path') || '/';
		if (p !== '/') {
			setCurrentPath(decodeURI(p));
			refreshFiles();
		}
	}, [searchParams]);

	return (
		<Breadcrumbs 
			className="p-2 bg-gray-100 w-full " 
			separator={<FaChevronRight className="text-gray-400" />}
		>
			<BreadcrumbItem 
				key="home" 
				onClick={() => handleClick(-1)}
				className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:cursor-pointer"
			>
				<FaHome className="mr-1" />
				Главная
			</BreadcrumbItem>
			{pathSegments.map((segment, index) => (
				<BreadcrumbItem 
					key={index} 
					onClick={() => handleClick(index)}
					className="text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:cursor-pointer"
				>
					{segment}
				</BreadcrumbItem>
			))}
		</Breadcrumbs>
	);
};

export default BreadCrumbs;
