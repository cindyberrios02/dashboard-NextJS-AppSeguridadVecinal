// src/components/dashboard/StatsCard.js
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

export default function StatsCard({ title, value, change, changeType, icon: Icon }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center text-sm">
            {changeType === 'positive' ? (
              <>
                <ChevronUpIcon className="h-4 w-4 text-green-500" />
                <span className="text-green-600 font-medium">{change}</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 text-red-500" />
                <span className="text-red-600 font-medium">{change}</span>
              </>
            )}
            <span className="text-gray-500 ml-1">desde el mes pasado</span>
          </div>
        </div>
      </div>
    </div>
  );
}