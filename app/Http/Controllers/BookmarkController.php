<?php

namespace App\Http\Controllers;

use App\Models\Bookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Dashboard', [
            'bookmarks' => $request->user()->bookmarks()->orderBy('sort_order')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'external_url' => 'required|url|max:255',
            'internal_url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $request->user()->bookmarks()->create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Bookmark $bookmark)
    {
        if ($bookmark->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'external_url' => 'required|url|max:255',
            'internal_url' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $bookmark->update($validated);

        return redirect()->back();
    }

    public function destroy(Request $request, Bookmark $bookmark)
    {
        if ($bookmark->user_id !== $request->user()->id) {
            abort(403);
        }

        $bookmark->delete();

        return redirect()->back();
    }
}
