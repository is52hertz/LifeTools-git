#ifndef EDITOR_EXPORT_PAGE_INCLUDED
#define EDITOR_EXPORT_PAGE_INCLUDED




#include "minorGems/ui/event/ActionListener.h"
#include "minorGems/util/SimpleVector.h"

#include "minorGems/game/game.h"


#include "GamePage.h"
#include "TextButton.h"
#include "TextField.h"

#include "Picker.h"

#include "objectBank.h"

#include "keyLegend.h"


#define NUM_TREE_TRANS_TO_SHOW 1



class EditorExportPage : public GamePage, public ActionListener {
        
    public:
        EditorExportPage();
        ~EditorExportPage();

        virtual void actionPerformed( GUIComponent *inTarget );
        
        virtual void draw( doublePair inViewCenter, 
                           double inViewSize );
        
        virtual void step();
  
        virtual void makeActive( char inFresh );
        

        virtual void pointerMove( float inX, float inY );
        virtual void pointerDown( float inX, float inY );
        virtual void pointerDrag( float inX, float inY );
        virtual void pointerUp( float inX, float inY );
        
        virtual void keyDown( unsigned char inASCII );
        virtual void specialKeyDown( int inKeyCode );
        
    protected:
        
        Picker mObjectPicker;

        TextButton mObjectEditorButton;
        
        TextButton mExportButton;
        TextButton mClearButton;
        TextButton mCopyHashButton;
        
        TextButton mCopyIDListButton;
        TextButton mPasteIDListButton;
        

        TextField mExportTagField;

        int mSelectionIndex;

        KeyLegend mKeyLegend;

        char mSearchNeedsRedo;
        
        char *mCurrentHash;
        
        
        char *mCurrentErrorMessage;
        

        void updateVisible();

        void setErrorMessage( const char *inMessage );
        
        void clearErrorMessage();
        

        // updates mSelectionIndex based on the last new object 
        // in getCurrentExportList() that is not in inOldList
        void updateSelection( SimpleVector<int> *inOldList );
        
    };



#endif
