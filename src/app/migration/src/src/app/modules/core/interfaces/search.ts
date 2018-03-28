/**
 * Interface
 */
export interface SearchParam {

    /**
     * Content status
     */
    status?: string[];
    /**
     * Content type - course,textbook,content
     */
    contentType?: string[];
<<<<<<< HEAD
    /**
     * Content concept
     */
    concept?: Array<object>;
=======

>>>>>>> upstream/angular-migration
    /**
     * Additional params - userId, lastUpdatedOn, sort etc
     */
    params?: any;
    /**
     * createdBy id
     */
    createdBy?: string;
    /**
     * Organization ids
     */
    orgid?: string[];
    /**
    * page limit
    */
   limit?: number;
   /**
    * page offset
    */
   offset?: number;

   pageNumber?: number;
   /**
    * page mimeType
    */
   mimeType?: Array<string>;
   /**
    * page query
    */
   query?: string;
   /**
    * page channel
    */
   channel?: string;
   /**
    * page objectType
    */
   objectType?: string[];
    /**
    * page objectType
    */
   board?: string[];
   language?: string[];
   subject?: string[];
   gradeLevel?: string[];

  }
