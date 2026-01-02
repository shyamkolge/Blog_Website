import React from 'react'

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 mt-16 py-8">
      <div className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Medium</h3>
            <p className="text-gray-600 text-sm">
              A place to share knowledge and connect with readers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition">About</a></li>
              <li><a href="#" className="hover:text-black transition">Careers</a></li>
              <li><a href="#" className="hover:text-black transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition">Help Center</a></li>
              <li><a href="#" className="hover:text-black transition">Privacy</a></li>
              <li><a href="#" className="hover:text-black transition">Terms</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-black transition">Twitter</a></li>
              <li><a href="#" className="hover:text-black transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-black transition">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} Medium. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer